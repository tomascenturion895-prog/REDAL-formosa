-- REDAL: creación segura de pedidos.
-- El cliente solo envía qué productos y cuántos; precios, disponibilidad y envío
-- se calculan acá. Antes el navegador armaba el pedido y podía fijar cualquier monto
-- (y las tablas pedido_items/pagos no tenían política de INSERT).

-- Coordenadas de entrega (opcionales, ambas o ninguna). Alimentan el mapa de seguimiento.
alter table public.pedidos
  add column if not exists entrega_lat double precision check (entrega_lat between -90 and 90),
  add column if not exists entrega_lng double precision check (entrega_lng between -180 and 180);

alter table public.pedidos
  drop constraint if exists pedidos_entrega_coords_juntas,
  add constraint pedidos_entrega_coords_juntas check ((entrega_lat is null) = (entrega_lng is null));

create or replace function public.calcular_envio(cantidad_lineas int)
returns numeric
language sql
immutable
as $$
  select (100 + 50 * greatest(cantidad_lineas, 0))::numeric;
$$;

create or replace function public.crear_pedido(
  p_emprendimiento_id uuid,
  p_items jsonb,
  p_direccion text,
  p_nota text default null,
  p_lat double precision default null,
  p_lng double precision default null
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
  r record;
begin
  if v_user is null then
    raise exception 'Tenés que iniciar sesión para comprar' using errcode = '42501';
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
  --    trigger protect_pedido_columns descartaría).
  v_numero := 'PED-' || to_char(now(), 'YYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.pedidos (
    numero_pedido, comprador_id, emprendimiento_id, estado, tipo_entrega,
    direccion_entrega, nota_cliente, monto_total, monto_envio,
    entrega_lat, entrega_lng, ubicacion_entrega
  ) values (
    v_numero, v_user, p_emprendimiento_id, 'pendiente_pago', 'domicilio',
    btrim(p_direccion), nullif(btrim(coalesce(p_nota, '')), ''),
    v_subtotal + v_envio, v_envio,
    p_lat, p_lng,
    case when p_lat is null then null
         else st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography end
  ) returning id into v_pedido;

  insert into public.pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
  select v_pedido, l.producto_id, l.cantidad, l.precio, l.precio * l.cantidad
  from jsonb_to_recordset(v_lineas) as l(producto_id uuid, cantidad int, precio numeric);

  insert into public.pagos (pedido_id, monto, estado, proveedor)
  values (v_pedido, v_subtotal + v_envio, 'pendiente', 'mercadopago');

  return query select v_pedido, v_numero, v_subtotal + v_envio;
end;
$$;

revoke all on function public.crear_pedido(uuid, jsonb, text, text, double precision, double precision) from public, anon;
grant execute on function public.crear_pedido(uuid, jsonb, text, text, double precision, double precision) to authenticated;
grant execute on function public.calcular_envio(int) to anon, authenticated;
