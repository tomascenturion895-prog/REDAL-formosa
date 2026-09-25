-- REDAL: pedidos del vendedor y operaciones de administración.
-- - productor_pedidos(): los pedidos pagados de mis emprendimientos, con ítems y nombre del comprador
--   (profiles no es legible por terceros, por eso va en una función security definer).
-- - productor_avanzar_pedido(): único camino del vendedor para avanzar un pedido, con transiciones permitidas.
-- - admin_resumen(): tablero del administrador (pendientes, tendencia semanal, calidad).
-- - admin_pending_verifications() / admin_review_verification(): cola de verificación de identidad.

-- ============ VENDEDOR ============

create or replace function public.productor_pedidos()
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
  items jsonb
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

create or replace function public.productor_avanzar_pedido(p_pedido_id uuid, p_estado public.order_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actual public.order_status;
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
    (v_actual = 'en_preparacion' and p_estado = 'listo')
  ) then
    raise exception 'Ese cambio de estado no está permitido' using errcode = '22023';
  end if;

  update public.pedidos set estado = p_estado where id = p_pedido_id;
end;
$$;

revoke all on function public.productor_pedidos() from public, anon;
revoke all on function public.productor_avanzar_pedido(uuid, public.order_status) from public, anon;
grant execute on function public.productor_pedidos() to authenticated;
grant execute on function public.productor_avanzar_pedido(uuid, public.order_status) to authenticated;

-- ============ ADMINISTRADOR ============

create or replace function public.admin_resumen()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_pagados constant public.order_status[] := array['pagado', 'en_preparacion', 'listo', 'en_camino', 'entregado']::public.order_status[];
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'productos_pendientes',
      (select count(*) from public.productos where validado = false and razon_rechazo is null),
    'verificaciones_pendientes',
      (select count(*) from public.validacion_biometrica
         where estado in ('pendiente', 'pending_review')
           and dni_frente_url is not null and dni_reverso_url is not null and selfie_url is not null),
    'pedidos_sin_preparar',
      (select count(*) from public.pedidos where estado = 'pagado' and created_at < now() - interval '24 hours'),
    'pedidos_7d',
      (select count(*) from public.pedidos where estado = any (v_pagados) and created_at >= now() - interval '7 days'),
    'pedidos_7d_previos',
      (select count(*) from public.pedidos
         where estado = any (v_pagados)
           and created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'),
    'ingresos_7d',
      (select coalesce(sum(monto_total), 0) from public.pedidos
         where estado = any (v_pagados) and created_at >= now() - interval '7 days'),
    'ingresos_7d_previos',
      (select coalesce(sum(monto_total), 0) from public.pedidos
         where estado = any (v_pagados)
           and created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'),
    'pedidos_30d',
      (select count(*) from public.pedidos where created_at >= now() - interval '30 days' and estado <> 'pendiente_pago'),
    'cancelados_30d',
      (select count(*) from public.pedidos where created_at >= now() - interval '30 days' and estado = 'cancelado'),
    'productores_activos',
      (select count(*) from public.emprendimientos where activo = true and deleted_at is null),
    'productores_con_pedidos_30d',
      (select count(distinct emprendimiento_id) from public.pedidos
         where created_at >= now() - interval '30 days' and estado = any (v_pagados)),
    'calificacion_promedio',
      (select round(avg(puntuacion)::numeric, 2) from public.calificaciones),
    'total_calificaciones',
      (select count(*) from public.calificaciones)
  );
end;
$$;

create or replace function public.admin_pending_verifications()
returns table (
  id uuid,
  user_id uuid,
  full_name text,
  email text,
  emprendimiento_nombre text,
  dni_frente_url text,
  dni_reverso_url text,
  selfie_url text,
  created_at timestamptz
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
  select v.id, v.user_id, pr.full_name, u.email::text,
         (select e.nombre from public.emprendimientos e where e.owner_id = v.user_id order by e.created_at limit 1),
         v.dni_frente_url, v.dni_reverso_url, v.selfie_url, v.updated_at
  from public.validacion_biometrica v
  left join public.profiles pr on pr.id = v.user_id
  left join auth.users u on u.id = v.user_id
  where v.estado in ('pendiente', 'pending_review')
    and v.dni_frente_url is not null and v.dni_reverso_url is not null and v.selfie_url is not null
  order by v.updated_at;
end;
$$;

create or replace function public.admin_review_verification(
  p_id uuid,
  p_approve boolean,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if not p_approve and (p_reason is null or btrim(p_reason) = '') then
    raise exception 'El rechazo requiere un motivo';
  end if;

  update public.validacion_biometrica
  set estado = case when p_approve then 'approved'::public.verification_status else 'rejected'::public.verification_status end,
      rechazo_razon = case when p_approve then null else p_reason end
  where id = p_id
  returning user_id into v_user;

  if v_user is null then
    raise exception 'Verificación no encontrada';
  end if;

  update public.profiles
  set verification_status = case when p_approve then 'approved'::public.verification_status else 'rejected'::public.verification_status end,
      verified_at = case when p_approve then now() else null end
  where id = v_user;

  insert into public.admin_audit_log (admin_id, accion, entidad, entidad_id, cambios)
  values (
    auth.uid(),
    case when p_approve then 'APROBAR_VERIFICACION' else 'RECHAZAR_VERIFICACION' end,
    'verificacion',
    p_id,
    jsonb_build_object('motivo', p_reason)
  );
end;
$$;

revoke all on function public.admin_resumen() from public, anon;
revoke all on function public.admin_pending_verifications() from public, anon;
revoke all on function public.admin_review_verification(uuid, boolean, text) from public, anon;
grant execute on function public.admin_resumen() to authenticated;
grant execute on function public.admin_pending_verifications() to authenticated;
grant execute on function public.admin_review_verification(uuid, boolean, text) to authenticated;
