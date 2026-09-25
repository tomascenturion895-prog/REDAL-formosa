-- REDAL: vistas de historial de pedidos del comprador.
-- security_invoker: se aplican las políticas RLS de pedidos y pedido_items.

create or replace view public.usuario_pedidos
with (security_invoker = true) as
select
  o.id,
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
  coalesce(sum(i.cantidad), 0) as total_unidades
from public.pedidos o
join public.emprendimientos e on e.id = o.emprendimiento_id
left join public.pedido_items i on i.pedido_id = o.id
where o.deleted_at is null
group by o.id, e.nombre;

create or replace view public.pedido_detalles_completos
with (security_invoker = true) as
select
  i.id as detalle_id,
  i.pedido_id,
  i.producto_id,
  i.cantidad,
  i.precio_unitario,
  i.subtotal,
  p.nombre as producto_nombre,
  p.imagen_url as producto_imagen,
  p.unidad as producto_unidad,
  o.comprador_id,
  o.estado as pedido_estado
from public.pedido_items i
join public.productos p on p.id = i.producto_id
join public.pedidos o on o.id = i.pedido_id;

-- Los montos se agregan sobre pedidos y los conteos de productos en subconsultas:
-- unir pedidos con ítems repetiría el monto de cada pedido una vez por producto.
create or replace view public.usuario_compras_stats
with (security_invoker = true) as
select
  o.comprador_id,
  count(*) as total_pedidos,
  coalesce(sum(o.monto_total), 0) as gasto_total,
  coalesce(round(avg(o.monto_total), 2), 0) as gasto_promedio,
  (
    select count(distinct i.producto_id)
    from public.pedido_items i
    join public.pedidos p on p.id = i.pedido_id
    where p.comprador_id = o.comprador_id
      and p.estado not in ('cancelado', 'pendiente_pago') and p.deleted_at is null
  ) as productos_diferentes,
  (
    select coalesce(sum(i.cantidad), 0)
    from public.pedido_items i
    join public.pedidos p on p.id = i.pedido_id
    where p.comprador_id = o.comprador_id
      and p.estado not in ('cancelado', 'pendiente_pago') and p.deleted_at is null
  ) as total_unidades,
  max(o.created_at) as ultimo_pedido
from public.pedidos o
where o.estado not in ('cancelado', 'pendiente_pago')
  and o.deleted_at is null
group by o.comprador_id;
