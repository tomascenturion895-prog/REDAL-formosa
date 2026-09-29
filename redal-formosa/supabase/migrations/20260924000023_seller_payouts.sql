-- REDAL: liquidaciones a vendedores.
-- El comprador paga a la cuenta de la plataforma; hasta ahora no había registro de cuánto se le debe
-- a cada emprendimiento ni de qué se le transfirió. Se agrega un libro de liquidaciones: cada una agrupa
-- pedidos entregados y pagos (sin reembolso) que todavía no se habían liquidado, con la comisión vigente.
-- La transferencia se hace fuera de la app; el administrador registra la referencia (nº de operación).
-- Un pedido no puede liquidarse dos veces (clave primaria en liquidacion_pedidos).

-- ============ CONFIGURACIÓN ============

create table public.configuracion_plataforma (
  id boolean primary key default true check (id),
  comision_pct numeric(5, 2) not null default 0 check (comision_pct between 0 and 100),
  updated_at timestamptz not null default now()
);
insert into public.configuracion_plataforma default values;
alter table public.configuracion_plataforma enable row level security;
-- Sin políticas: solo se accede desde las funciones de abajo.

-- ============ LIBRO DE LIQUIDACIONES ============

create table public.liquidaciones (
  id uuid primary key default gen_random_uuid(),
  emprendimiento_id uuid not null references public.emprendimientos (id) on delete restrict,
  cantidad_pedidos integer not null check (cantidad_pedidos > 0),
  monto_bruto numeric(12, 2) not null check (monto_bruto >= 0),
  comision_pct numeric(5, 2) not null,
  comision numeric(12, 2) not null check (comision >= 0),
  monto_neto numeric(12, 2) not null check (monto_neto >= 0),
  referencia text not null check (length(btrim(referencia)) between 3 and 120),
  pagado_por uuid not null references public.profiles (id),
  pagado_en timestamptz not null default now()
);
create index liquidaciones_emprendimiento_idx on public.liquidaciones (emprendimiento_id, pagado_en desc);

create table public.liquidacion_pedidos (
  pedido_id uuid primary key references public.pedidos (id) on delete restrict,
  liquidacion_id uuid not null references public.liquidaciones (id) on delete cascade
);
create index liquidacion_pedidos_liquidacion_idx on public.liquidacion_pedidos (liquidacion_id);

alter table public.liquidaciones enable row level security;
alter table public.liquidacion_pedidos enable row level security;

-- El vendedor ve sus liquidaciones; nadie escribe directo (solo admin_liquidar).
create policy "Ver liquidaciones propias" on public.liquidaciones for select
  using (exists (select 1 from public.emprendimientos e where e.id = emprendimiento_id and e.owner_id = auth.uid()));
create policy "Admin ve liquidaciones" on public.liquidaciones for select using (public.is_admin());
create policy "Admin ve pedidos liquidados" on public.liquidacion_pedidos for select using (public.is_admin());

revoke insert, update, delete on public.liquidaciones, public.liquidacion_pedidos, public.configuracion_plataforma from anon, authenticated;

-- ============ CÁLCULO ============

-- Base de un pedido para el vendedor: lo que vendió. El envío es suyo solo si entrega él mismo;
-- si lo lleva un repartidor, el envío le corresponde al repartidor.
create or replace function public.pedido_monto_vendedor(p_total numeric, p_envio numeric, p_repartidor uuid)
returns numeric
language sql
immutable
as $$
  select case when p_repartidor is null then p_total else p_total - coalesce(p_envio, 0) end;
$$;

-- Pedidos entregados, con pago aprobado, todavía sin liquidar.
create or replace view public.pedidos_por_liquidar
with (security_invoker = true) as
select p.id as pedido_id,
       p.emprendimiento_id,
       public.pedido_monto_vendedor(p.monto_total, p.monto_envio, p.repartidor_id) as monto
from public.pedidos p
join public.pagos g on g.pedido_id = p.id and g.estado = 'aprobado'
where p.estado = 'entregado'
  and p.deleted_at is null
  and not exists (select 1 from public.liquidacion_pedidos lp where lp.pedido_id = p.id);

revoke all on public.pedidos_por_liquidar from public, anon;

-- ============ ADMINISTRADOR ============

create or replace function public.admin_liquidaciones_pendientes()
returns table (
  emprendimiento_id uuid,
  emprendimiento_nombre text,
  owner_id uuid,
  cantidad_pedidos bigint,
  monto_bruto numeric,
  comision_pct numeric,
  comision numeric,
  monto_neto numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_pct numeric;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  select c.comision_pct into v_pct from public.configuracion_plataforma c;

  return query
  select e.id, e.nombre, e.owner_id, count(*), sum(x.monto),
         v_pct,
         round(sum(x.monto) * v_pct / 100, 2),
         sum(x.monto) - round(sum(x.monto) * v_pct / 100, 2)
  from public.pedidos_por_liquidar x
  join public.emprendimientos e on e.id = x.emprendimiento_id
  group by e.id, e.nombre, e.owner_id
  order by sum(x.monto) desc;
end;
$$;

create or replace function public.admin_liquidar(p_emprendimiento uuid, p_referencia text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pct numeric;
  v_ids uuid[];
  v_bruto numeric;
  v_comision numeric;
  v_liq uuid;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_referencia is null or length(btrim(p_referencia)) < 3 then
    raise exception 'Ingresá el número de operación de la transferencia' using errcode = '22023';
  end if;

  -- Serializa liquidaciones del mismo emprendimiento: dos clics no pagan dos veces lo mismo.
  perform 1 from public.emprendimientos where id = p_emprendimiento for update;
  if not found then
    raise exception 'Emprendimiento no encontrado' using errcode = '22023';
  end if;

  select c.comision_pct into v_pct from public.configuracion_plataforma c;

  select array_agg(x.pedido_id), sum(x.monto)
    into v_ids, v_bruto
  from public.pedidos_por_liquidar x
  where x.emprendimiento_id = p_emprendimiento;

  if v_ids is null then
    raise exception 'No hay pedidos para liquidar' using errcode = '22023';
  end if;

  v_comision := round(v_bruto * v_pct / 100, 2);

  insert into public.liquidaciones (emprendimiento_id, cantidad_pedidos, monto_bruto, comision_pct, comision, monto_neto, referencia, pagado_por)
  values (p_emprendimiento, cardinality(v_ids), v_bruto, v_pct, v_comision, v_bruto - v_comision, btrim(p_referencia), auth.uid())
  returning id into v_liq;

  insert into public.liquidacion_pedidos (pedido_id, liquidacion_id)
  select unnest(v_ids), v_liq;

  return v_liq;
end;
$$;

create or replace function public.admin_set_comision(p_pct numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_pct is null or p_pct < 0 or p_pct > 100 then
    raise exception 'La comisión debe estar entre 0 y 100' using errcode = '22023';
  end if;
  update public.configuracion_plataforma set comision_pct = p_pct, updated_at = now();
end;
$$;

create or replace function public.admin_comision()
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return (select comision_pct from public.configuracion_plataforma);
end;
$$;

-- ============ VENDEDOR ============

-- Lo que la plataforma le debe hoy a cada emprendimiento de la persona (con la comisión vigente).
create or replace function public.productor_cobro_pendiente()
returns table (
  emprendimiento_id uuid,
  emprendimiento_nombre text,
  cantidad_pedidos bigint,
  monto_bruto numeric,
  comision_pct numeric,
  comision numeric,
  monto_neto numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_pct numeric;
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  select c.comision_pct into v_pct from public.configuracion_plataforma c;

  return query
  select e.id, e.nombre, count(x.pedido_id), coalesce(sum(x.monto), 0),
         v_pct,
         round(coalesce(sum(x.monto), 0) * v_pct / 100, 2),
         coalesce(sum(x.monto), 0) - round(coalesce(sum(x.monto), 0) * v_pct / 100, 2)
  from public.emprendimientos e
  left join public.pedidos_por_liquidar x on x.emprendimiento_id = e.id
  where e.owner_id = auth.uid()
  group by e.id, e.nombre
  order by e.nombre;
end;
$$;

revoke all on function public.pedido_monto_vendedor(numeric, numeric, uuid) from public, anon;
revoke all on function public.admin_liquidaciones_pendientes() from public, anon;
revoke all on function public.admin_liquidar(uuid, text) from public, anon;
revoke all on function public.admin_set_comision(numeric) from public, anon;
revoke all on function public.admin_comision() from public, anon;
revoke all on function public.productor_cobro_pendiente() from public, anon;
grant execute on function public.pedido_monto_vendedor(numeric, numeric, uuid) to authenticated;
grant execute on function public.admin_liquidaciones_pendientes() to authenticated;
grant execute on function public.admin_liquidar(uuid, text) to authenticated;
grant execute on function public.admin_set_comision(numeric) to authenticated;
grant execute on function public.admin_comision() to authenticated;
grant execute on function public.productor_cobro_pendiente() to authenticated;
grant select on public.liquidaciones to authenticated;
