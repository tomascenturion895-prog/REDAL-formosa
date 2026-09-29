-- Código de entrega (PIN) y retención antes de liquidar.
--
-- Hasta ahora bastaba con que el vendedor o el repartidor marcaran «entregado» para que el pedido
-- quedara cobrable. Ahora:
--  * cada pedido tiene un código de 4 dígitos que solo ve el comprador (tabla aparte: las políticas de
--    pedidos dejan leer la fila completa al vendedor y al repartidor, así que no puede vivir ahí);
--  * pasar a «entregado» exige ese código; 5 errores bloquean el pedido 15 minutos;
--  * un pedido entregado recién se liquida a las 48 horas, para dar tiempo a reclamar.
--
-- Las funciones de avance devolvían void y levantaban excepción; ahora devuelven un texto porque una
-- excepción revertiría el contador de intentos fallidos.

-- ============ TABLA DE CÓDIGOS ============

create table if not exists public.pedido_pin (
  pedido_id uuid primary key references public.pedidos (id) on delete cascade,
  pin text not null check (pin ~ '^[0-9]{4}$'),
  intentos smallint not null default 0,
  bloqueado_hasta timestamptz,
  created_at timestamptz not null default now()
);

alter table public.pedido_pin enable row level security;

drop policy if exists "Comprador ve el código de su pedido" on public.pedido_pin;
create policy "Comprador ve el código de su pedido" on public.pedido_pin for select
  using (exists (select 1 from public.pedidos p where p.id = pedido_id and p.comprador_id = auth.uid()));

revoke all on public.pedido_pin from anon, authenticated;
grant select on public.pedido_pin to authenticated;

create or replace function public.nuevo_pin_entrega()
returns text
language sql
volatile
set search_path = public
as $$
  -- gen_random_uuid() usa el generador criptográfico del servidor.
  select lpad((('x' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))::bit(32)::bigint % 10000)::text, 4, '0');
$$;

create or replace function public.crear_pin_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pedido_pin (pedido_id, pin) values (new.id, public.nuevo_pin_entrega())
  on conflict (pedido_id) do nothing;
  return new;
end;
$$;

drop trigger if exists crear_pin_pedido on public.pedidos;
create trigger crear_pin_pedido
  after insert on public.pedidos
  for each row execute function public.crear_pin_pedido();

-- Pedidos existentes que todavía pueden entregarse.
insert into public.pedido_pin (pedido_id, pin)
select id, public.nuevo_pin_entrega()
from public.pedidos
where estado in ('pagado', 'en_preparacion', 'listo', 'en_camino')
on conflict (pedido_id) do nothing;

-- ============ VERIFICACIÓN ============

create or replace function public.verificar_pin_entrega(p_pedido_id uuid, p_pin text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.pedido_pin%rowtype;
begin
  select * into v from public.pedido_pin where pedido_id = p_pedido_id for update;
  if not found then
    return 'ok'; -- pedido anterior a esta migración, sin código
  end if;
  if v.bloqueado_hasta is not null and v.bloqueado_hasta > now() then
    return 'pin_bloqueado';
  end if;
  if p_pin is null or btrim(p_pin) = '' then
    return 'pin_requerido';
  end if;
  if btrim(p_pin) <> v.pin then
    if v.intentos + 1 >= 5 then
      update public.pedido_pin set intentos = 0, bloqueado_hasta = now() + interval '15 minutes' where pedido_id = p_pedido_id;
      return 'pin_bloqueado';
    end if;
    update public.pedido_pin set intentos = intentos + 1 where pedido_id = p_pedido_id;
    return 'pin_incorrecto';
  end if;
  update public.pedido_pin set intentos = 0, bloqueado_hasta = null where pedido_id = p_pedido_id;
  return 'ok';
end;
$$;

revoke all on function public.verificar_pin_entrega(uuid, text) from public, anon, authenticated;

-- ============ AVANCE DE ESTADO ============

drop function if exists public.productor_avanzar_pedido(uuid, public.order_status);
drop function if exists public.repartidor_avanzar_pedido(uuid, public.order_status);

create or replace function public.productor_avanzar_pedido(p_pedido_id uuid, p_estado public.order_status, p_pin text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actual public.order_status;
  v_pin text;
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select p.estado into v_actual
  from public.pedidos p
  join public.emprendimientos e on e.id = p.emprendimiento_id
  where p.id = p_pedido_id and e.owner_id = auth.uid() and p.deleted_at is null
  for update of p;

  if not found then
    raise exception 'Pedido no encontrado' using errcode = '42501';
  end if;

  if not (
    (v_actual = 'pagado' and p_estado = 'en_preparacion') or
    (v_actual = 'en_preparacion' and p_estado = 'listo') or
    (v_actual = 'listo' and p_estado = 'en_camino') or
    (v_actual = 'en_camino' and p_estado = 'entregado')
  ) then
    raise exception 'Ese cambio de estado no está permitido' using errcode = '22023';
  end if;

  if p_estado = 'entregado' then
    v_pin := public.verificar_pin_entrega(p_pedido_id, p_pin);
    if v_pin <> 'ok' then
      return v_pin;
    end if;
  end if;

  update public.pedidos
  set estado = p_estado,
      entregado_en = case when p_estado = 'entregado' then now() else entregado_en end
  where id = p_pedido_id;

  return 'ok';
end;
$$;

create or replace function public.repartidor_avanzar_pedido(p_pedido_id uuid, p_estado public.order_status, p_pin text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_repartidor uuid;
  v_actual public.order_status;
  v_pin text;
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select r.id into v_repartidor
  from public.repartidores r
  where r.user_id = auth.uid() and r.activo = true and r.deleted_at is null;

  if v_repartidor is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select p.estado into v_actual
  from public.pedidos p
  where p.id = p_pedido_id and p.repartidor_id = v_repartidor and p.deleted_at is null
  for update of p;

  if not found then
    raise exception 'Pedido no encontrado' using errcode = '42501';
  end if;

  if not (
    (v_actual = 'listo' and p_estado = 'en_camino') or
    (v_actual = 'en_camino' and p_estado = 'entregado')
  ) then
    raise exception 'Ese cambio de estado no está permitido' using errcode = '22023';
  end if;

  if p_estado = 'entregado' then
    v_pin := public.verificar_pin_entrega(p_pedido_id, p_pin);
    if v_pin <> 'ok' then
      return v_pin;
    end if;
  end if;

  update public.pedidos
  set estado = p_estado,
      entregado_en = case when p_estado = 'entregado' then now() else entregado_en end
  where id = p_pedido_id;

  if p_estado = 'entregado' then
    update public.repartidores set viajes_completados = coalesce(viajes_completados, 0) + 1 where id = v_repartidor;
  end if;

  return 'ok';
end;
$$;

revoke all on function public.productor_avanzar_pedido(uuid, public.order_status, text) from public, anon;
grant execute on function public.productor_avanzar_pedido(uuid, public.order_status, text) to authenticated;
revoke all on function public.repartidor_avanzar_pedido(uuid, public.order_status, text) from public, anon;
grant execute on function public.repartidor_avanzar_pedido(uuid, public.order_status, text) to authenticated;

-- ============ RETENCIÓN ============
-- Un pedido entregado se liquida recién 48 horas después de la entrega.

create or replace view public.pedidos_por_liquidar
with (security_invoker = true) as
select p.id as pedido_id,
       p.emprendimiento_id,
       public.pedido_monto_vendedor(p.monto_total, p.monto_envio, p.repartidor_id) as monto
from public.pedidos p
join public.pagos g on g.pedido_id = p.id and g.estado = 'aprobado'
where p.estado = 'entregado'
  and p.deleted_at is null
  and coalesce(p.entregado_en, p.updated_at) <= now() - interval '48 hours'
  and not exists (select 1 from public.liquidacion_pedidos lp where lp.pedido_id = p.id);

revoke all on public.pedidos_por_liquidar from public, anon;
