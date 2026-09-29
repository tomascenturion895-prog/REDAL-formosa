-- Medios de pago: tarjeta, dinero en cuenta y QR (los tres por Mercado Pago) y efectivo contra entrega.
--
-- * pedidos.metodo_pago guarda lo que eligió el comprador. Lo leen el comprador, el vendedor y el
--   repartidor (necesitan saber si hay que cobrar en mano) y ninguno puede cambiarlo directo.
-- * Un pedido en efectivo nace ya «pagado»: el vendedor lo prepara sin esperar un cobro online. El pago
--   queda pendiente y se marca aprobado cuando se entrega con el código del comprador (es ahí que el
--   dinero cambia de manos). Como la plataforma nunca recibe esa plata, no entra en las liquidaciones.
-- * Hasta 3 pedidos en efectivo en curso por comprador: sin pago previo, es el freno a los pedidos falsos.
--
-- crear_pedido conserva su firma anterior gracias al valor por defecto de p_metodo.

alter table public.pedidos
  add column if not exists metodo_pago text not null default 'tarjeta'
  check (metodo_pago in ('tarjeta', 'saldo', 'qr', 'efectivo'));

-- ============ COLUMNAS PROTEGIDAS ============

create or replace function public.protect_pedido_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;

  new.numero_pedido := old.numero_pedido;
  new.comprador_id := old.comprador_id;
  new.emprendimiento_id := old.emprendimiento_id;
  new.monto_total := old.monto_total;
  new.monto_envio := old.monto_envio;
  new.entrega_lat := old.entrega_lat;
  new.entrega_lng := old.entrega_lng;
  new.ubicacion_entrega := old.ubicacion_entrega;
  new.repartidor_id := old.repartidor_id;
  new.codigo_pin_entrega := old.codigo_pin_entrega;
  new.entregado_en := old.entregado_en;
  new.tipo_entrega := old.tipo_entrega;
  new.deleted_at := old.deleted_at;
  new.metodo_pago := old.metodo_pago;

  if new.estado is distinct from old.estado
     and not (old.estado = 'pendiente_pago' and new.estado = 'cancelado') then
    raise exception 'Ese cambio de estado no está permitido' using errcode = '22023';
  end if;
  return new;
end;
$$;

-- ============ CREAR PEDIDO ============

drop function if exists public.crear_pedido(uuid, jsonb, text, text, double precision, double precision);

create or replace function public.crear_pedido(
  p_emprendimiento_id uuid,
  p_items jsonb,
  p_direccion text,
  p_nota text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_metodo text default 'tarjeta'
)
returns table (out_pedido_id uuid, out_numero text, out_monto numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pedido uuid;
  v_numero text;
  v_subtotal numeric := 0;
  v_lineas jsonb := '[]'::jsonb;
  v_cantidad_lineas int := 0;
  v_envio numeric;
  v_prod public.productos%rowtype;
  v_efectivo boolean := (p_metodo = 'efectivo');
  r record;
begin
  if v_user is null then
    raise exception 'Tenés que iniciar sesión para comprar' using errcode = '42501';
  end if;
  if p_metodo is null or p_metodo not in ('tarjeta', 'saldo', 'qr', 'efectivo') then
    raise exception 'Elegí un medio de pago válido';
  end if;
  if p_direccion is null or btrim(p_direccion) = '' then
    raise exception 'La dirección de entrega es obligatoria';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;
  if (p_lat is null) <> (p_lng is null) then
    raise exception 'La ubicación de entrega necesita latitud y longitud';
  end if;
  if p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'La ubicación de entrega no es válida';
  end if;

  if v_efectivo and (
    select count(*) from public.pedidos
    where comprador_id = v_user
      and metodo_pago = 'efectivo'
      and estado in ('pagado', 'en_preparacion', 'listo', 'en_camino')
  ) >= 3 then
    raise exception 'Ya tenés 3 pedidos en efectivo en curso. Esperá a recibirlos o pagá este con Mercado Pago.';
  end if;

  -- 1) Validar y valuar cada producto con los datos de la base.
  for r in
    select x.producto_id, sum(x.cantidad)::int as cantidad
    from (
      select (e ->> 'producto_id')::uuid as producto_id, (e ->> 'cantidad')::int as cantidad
      from jsonb_array_elements(p_items) e
    ) x
    group by x.producto_id
  loop
    if r.cantidad is null or r.cantidad < 1 or r.cantidad > 99 then
      raise exception 'Cantidad inválida';
    end if;

    select * into v_prod
    from public.productos
    where id = r.producto_id
      and emprendimiento_id = p_emprendimiento_id
      and disponible and validado;

    if not found then
      raise exception 'Uno de los productos del carrito ya no está disponible';
    end if;

    v_lineas := v_lineas || jsonb_build_object(
      'producto_id', v_prod.id, 'cantidad', r.cantidad, 'precio', v_prod.precio
    );
    v_subtotal := v_subtotal + v_prod.precio * r.cantidad;
    v_cantidad_lineas := v_cantidad_lineas + 1;
  end loop;

  v_envio := public.calcular_envio(v_cantidad_lineas);

  -- 2) Crear el pedido ya con su monto final (sin updates posteriores, que el
  --    trigger protect_pedido_columns descartaría). En efectivo nace «pagado»: no hay cobro online que esperar.
  v_numero := 'PED-' || to_char(now(), 'YYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.pedidos (
    numero_pedido, comprador_id, emprendimiento_id, estado, tipo_entrega,
    direccion_entrega, nota_cliente, monto_total, monto_envio,
    entrega_lat, entrega_lng, ubicacion_entrega, metodo_pago
  ) values (
    v_numero, v_user, p_emprendimiento_id,
    case when v_efectivo then 'pagado'::public.order_status else 'pendiente_pago'::public.order_status end,
    'domicilio',
    btrim(p_direccion), nullif(btrim(coalesce(p_nota, '')), ''),
    v_subtotal + v_envio, v_envio,
    p_lat, p_lng,
    case when p_lat is null then null
         else st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography end,
    p_metodo
  ) returning id into v_pedido;

  insert into public.pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
  select v_pedido, l.producto_id, l.cantidad, l.precio, l.precio * l.cantidad
  from jsonb_to_recordset(v_lineas) as l(producto_id uuid, cantidad int, precio numeric);

  insert into public.pagos (pedido_id, monto, estado, proveedor)
  values (v_pedido, v_subtotal + v_envio, 'pendiente', case when v_efectivo then 'efectivo' else 'mercadopago' end);

  return query select v_pedido, v_numero, v_subtotal + v_envio;
end;
$$;

revoke all on function public.crear_pedido(uuid, jsonb, text, text, double precision, double precision, text) from public, anon;
grant execute on function public.crear_pedido(uuid, jsonb, text, text, double precision, double precision, text) to authenticated;

-- ============ ENTREGA: EL EFECTIVO SE COBRA AL ENTREGAR ============

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

  if p_estado = 'entregado' then
    update public.pagos set estado = 'aprobado' where pedido_id = p_pedido_id and proveedor = 'efectivo' and estado = 'pendiente';
  end if;

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
    update public.pagos set estado = 'aprobado' where pedido_id = p_pedido_id and proveedor = 'efectivo' and estado = 'pendiente';
  end if;

  return 'ok';
end;
$$;

revoke all on function public.productor_avanzar_pedido(uuid, public.order_status, text) from public, anon;
grant execute on function public.productor_avanzar_pedido(uuid, public.order_status, text) to authenticated;
revoke all on function public.repartidor_avanzar_pedido(uuid, public.order_status, text) from public, anon;
grant execute on function public.repartidor_avanzar_pedido(uuid, public.order_status, text) to authenticated;

-- ============ LIQUIDACIONES ============
-- Solo lo cobrado por Mercado Pago pasa por la plataforma; el efectivo ya lo tiene quien entregó.

create or replace view public.pedidos_por_liquidar
with (security_invoker = true) as
select p.id as pedido_id,
       p.emprendimiento_id,
       public.pedido_monto_vendedor(p.monto_total, p.monto_envio, p.repartidor_id) as monto
from public.pedidos p
join public.pagos g on g.pedido_id = p.id and g.estado = 'aprobado' and g.proveedor = 'mercadopago'
where p.estado = 'entregado'
  and p.deleted_at is null
  and coalesce(p.entregado_en, p.updated_at) <= now() - interval '48 hours'
  and not exists (select 1 from public.liquidacion_pedidos lp where lp.pedido_id = p.id);

revoke all on public.pedidos_por_liquidar from public, anon;

-- ============ LISTADO DE PEDIDOS DEL COMPRADOR ============
-- Se agrega metodo_pago al final (una vista solo admite columnas nuevas al final) para no mostrar «Pagado»
-- en un pedido en efectivo que todavía no se cobró.

create or replace view public.usuario_pedidos
with (security_invoker = true) as
select o.id,
       o.numero_pedido,
       o.comprador_id,
       o.emprendimiento_id,
       e.nombre as emprendimiento_nombre,
       o.estado,
       o.tipo_entrega,
       o.monto_total,
       o.monto_envio,
       o.created_at,
       o.updated_at,
       count(i.id) as cantidad_items,
       coalesce(sum(i.cantidad), 0::bigint) as total_unidades,
       o.metodo_pago
from public.pedidos o
join public.emprendimientos e on e.id = o.emprendimiento_id
left join public.pedido_items i on i.pedido_id = o.id
where o.deleted_at is null
group by o.id, e.nombre;
