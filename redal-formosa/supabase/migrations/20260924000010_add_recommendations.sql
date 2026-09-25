-- REDAL: recomendaciones (similares, más vendidos, nuevos, personalizadas).

-- Productos parecidos: mismo emprendimiento (peso 10) o misma categoría (peso 5).
-- security_invoker: RLS oculta lo que el usuario no puede ver.
create or replace view public.productos_similares
with (security_invoker = true) as
select
  p1.id as producto_id,
  p2.id as similar_id,
  p2.nombre,
  p2.precio,
  p2.imagen_url,
  case when p1.emprendimiento_id = p2.emprendimiento_id then 10 else 5 end as relevancia
from public.productos p1
join public.productos p2
  on p1.id <> p2.id
 and p2.disponible
 and (
   p1.emprendimiento_id = p2.emprendimiento_id
   or (p1.categoria_id is not null and p1.categoria_id = p2.categoria_id)
 );

create or replace view public.nuevos_productos
with (security_invoker = true) as
select id, nombre, precio, imagen_url, categoria_id, created_at
from public.productos
where disponible
order by created_at desc
limit 50;

-- Más vendidos: agrega ventas de todos los compradores, por eso es security definer.
-- Solo devuelve datos públicos del producto y un conteo; no expone pedidos ni personas.
create or replace function public.productos_mas_vendidos(max_results int default 8)
returns table (
  producto_id uuid,
  nombre text,
  precio numeric,
  imagen_url text,
  veces_comprado bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.nombre, p.precio, p.imagen_url, count(distinct i.pedido_id)
  from public.pedido_items i
  join public.pedidos o on o.id = i.pedido_id
  join public.productos p on p.id = i.producto_id
  where o.estado in ('pagado', 'en_preparacion', 'listo', 'en_camino', 'entregado')
    and p.disponible and p.validado
  group by p.id, p.nombre, p.precio, p.imagen_url
  order by count(distinct i.pedido_id) desc
  limit max_results;
$$;

-- Personalizadas: parte de favoritos y compras del usuario actual (RLS propio).
create or replace function public.recomendaciones_usuario(max_results int default 12)
returns table (
  producto_id uuid,
  nombre text,
  precio numeric,
  imagen_url text,
  relevancia int,
  razon text
)
language sql
stable
as $$
  with base as (
    select w.producto_id as pid, 'favoritos'::text as origen
    from public.wishlist w
    where w.usuario_id = auth.uid()
    union all
    select i.producto_id, 'compras'::text
    from public.pedido_items i
    join public.pedidos o on o.id = i.pedido_id
    where o.comprador_id = auth.uid()
  )
  select
    s.similar_id,
    s.nombre,
    s.precio,
    s.imagen_url,
    sum(s.relevancia)::int,
    case when bool_or(b.origen = 'compras')
      then 'basado_en_compras' else 'basado_en_favoritos' end
  from base b
  join public.productos_similares s on s.producto_id = b.pid
  where s.similar_id not in (select pid from base)
  group by s.similar_id, s.nombre, s.precio, s.imagen_url
  order by 5 desc
  limit max_results;
$$;

grant execute on function public.productos_mas_vendidos(int) to anon, authenticated;
grant execute on function public.recomendaciones_usuario(int) to authenticated;
