-- REDAL: operación de repartidores.
-- La tabla repartidores y la pantalla /tracking existían, pero nadie podía dar de alta a un repartidor,
-- ningún vendedor podía asignarle un pedido y el repartidor no podía marcar la entrega. Esta migración cierra el circuito:
--   admin_alta_repartidor / admin_baja_repartidor / admin_repartidores : el administrador gestiona la flota.
--   productor_repartidores / productor_asignar_repartidor              : el vendedor elige quién entrega su pedido.
--   repartidor_avanzar_pedido                                          : el repartidor marca "en camino" y "entregado".
--   productor_pedidos()                                                : ahora informa qué repartidor tiene cada pedido.

-- ============ ADMINISTRADOR ============

create or replace function public.admin_repartidores()
returns table (
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  tipo_vehiculo public.vehicle_type,
  activo boolean,
  entregas_activas bigint,
  viajes_completados integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
  select r.id, r.user_id, u.email::text, p.full_name, r.tipo_vehiculo, r.activo,
         (select count(*) from public.pedidos o
            where o.repartidor_id = r.id and o.estado in ('listo', 'en_camino') and o.deleted_at is null),
         coalesce(r.viajes_completados, 0)
  from public.repartidores r
  join auth.users u on u.id = r.user_id
  left join public.profiles p on p.id = r.user_id
  where r.deleted_at is null
  order by r.activo desc, r.created_at desc;
end;
$$;

create or replace function public.admin_alta_repartidor(p_email text, p_vehiculo public.vehicle_type)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select u.id into v_user from auth.users u where lower(u.email) = lower(btrim(p_email));
  if v_user is null then
    raise exception 'No hay ninguna cuenta con ese email. La persona tiene que registrarse primero.' using errcode = '22023';
  end if;

  insert into public.repartidores (user_id, tipo_vehiculo)
  values (v_user, p_vehiculo)
  on conflict (user_id) do update
    set tipo_vehiculo = excluded.tipo_vehiculo, activo = true, deleted_at = null
  returning id into v_id;

  insert into public.admin_audit_log (admin_id, accion, entidad, entidad_id, cambios)
  values (auth.uid(), 'ALTA_REPARTIDOR', 'repartidor', v_id, jsonb_build_object('vehiculo', p_vehiculo));

  return v_id;
end;
$$;

create or replace function public.admin_baja_repartidor(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  update public.repartidores set activo = false where id = p_id;
  if not found then
    raise exception 'Repartidor no encontrado' using errcode = '22023';
  end if;

  insert into public.admin_audit_log (admin_id, accion, entidad, entidad_id, cambios)
  values (auth.uid(), 'BAJA_REPARTIDOR', 'repartidor', p_id, '{}'::jsonb);
end;
$$;

-- ============ VENDEDOR ============

-- profiles no es legible por terceros: el vendedor ve solo el primer nombre y el vehículo de los repartidores activos.
create or replace function public.productor_repartidores()
returns table (id uuid, nombre text, tipo_vehiculo public.vehicle_type)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.emprendimientos where owner_id = auth.uid()) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
  select r.id,
         coalesce(nullif(split_part(btrim(p.full_name), ' ', 1), ''), 'Repartidor'),
         r.tipo_vehiculo
  from public.repartidores r
  left join public.profiles p on p.id = r.user_id
  where r.activo = true and r.deleted_at is null
  order by 2;
end;
$$;

create or replace function public.productor_asignar_repartidor(p_pedido_id uuid, p_repartidor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado public.order_status;
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select p.estado into v_estado
  from public.pedidos p
  join public.emprendimientos e on e.id = p.emprendimiento_id
  where p.id = p_pedido_id and e.owner_id = auth.uid() and p.deleted_at is null
  for update of p;

  if not found then
    raise exception 'Pedido no encontrado' using errcode = '42501';
  end if;

  -- Se puede asignar mientras el pedido todavía no salió; una vez en camino ya lo lleva alguien.
  if v_estado not in ('pagado', 'en_preparacion', 'listo') then
    raise exception 'Ese pedido ya no admite cambiar el repartidor' using errcode = '22023';
  end if;

  if p_repartidor_id is not null and not exists (
    select 1 from public.repartidores where id = p_repartidor_id and activo = true and deleted_at is null
  ) then
    raise exception 'Ese repartidor no está disponible' using errcode = '22023';
  end if;

  update public.pedidos set repartidor_id = p_repartidor_id where id = p_pedido_id;
end;
$$;

-- El tipo de retorno cambia (se suma el repartidor), así que hay que reemplazar la función.
drop function if exists public.productor_pedidos();

create function public.productor_pedidos()
returns table (
  id uuid,
  numero_pedido text,
  estado public.order_status,
  monto_total numeric,
  monto_envio numeric,
  direccion_entrega text,
  nota_cliente text,
  creado_en timestamptz,
  comprador_nombre text,
  emprendimiento_id uuid,
  emprendimiento_nombre text,
  items jsonb,
  repartidor_id uuid,
  repartidor_nombre text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.numero_pedido,
    p.estado,
    p.monto_total,
    p.monto_envio,
    p.direccion_entrega,
    p.nota_cliente,
    p.created_at,
    coalesce(nullif(btrim(pr.full_name), ''), 'Cliente de RedAL'),
    e.id,
    e.nombre,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'nombre', pd.nombre,
            'unidad', pd.unidad,
            'cantidad', i.cantidad,
            'subtotal', i.subtotal
          )
          order by pd.nombre
        )
        from public.pedido_items i
        join public.productos pd on pd.id = i.producto_id
        where i.pedido_id = p.id
      ),
      '[]'::jsonb
    ),
    p.repartidor_id,
    (
      select coalesce(nullif(split_part(btrim(rp.full_name), ' ', 1), ''), 'Repartidor')
      from public.repartidores r
      left join public.profiles rp on rp.id = r.user_id
      where r.id = p.repartidor_id
    )
  from public.pedidos p
  join public.emprendimientos e on e.id = p.emprendimiento_id
  left join public.profiles pr on pr.id = p.comprador_id
  where e.owner_id = auth.uid()
    and p.deleted_at is null
    and p.estado <> 'pendiente_pago'
  order by p.created_at desc
  limit 200;
end;
$$;

-- ============ REPARTIDOR ============

create or replace function public.repartidor_avanzar_pedido(p_pedido_id uuid, p_estado public.order_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_repartidor uuid;
  v_actual public.order_status;
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

  update public.pedidos
  set estado = p_estado,
      entregado_en = case when p_estado = 'entregado' then now() else entregado_en end
  where id = p_pedido_id;

  if p_estado = 'entregado' then
    update public.repartidores set viajes_completados = coalesce(viajes_completados, 0) + 1 where id = v_repartidor;
  end if;
end;
$$;

-- ============ PERMISOS ============

revoke all on function
  public.admin_repartidores(),
  public.admin_alta_repartidor(text, public.vehicle_type),
  public.admin_baja_repartidor(uuid),
  public.productor_repartidores(),
  public.productor_asignar_repartidor(uuid, uuid),
  public.productor_pedidos(),
  public.repartidor_avanzar_pedido(uuid, public.order_status)
from public, anon;

grant execute on function
  public.admin_repartidores(),
  public.admin_alta_repartidor(text, public.vehicle_type),
  public.admin_baja_repartidor(uuid),
  public.productor_repartidores(),
  public.productor_asignar_repartidor(uuid, uuid),
  public.productor_pedidos(),
  public.repartidor_avanzar_pedido(uuid, public.order_status)
to authenticated;
