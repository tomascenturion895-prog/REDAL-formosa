-- REDAL: búsqueda full-text de productos (español) con filtros.

alter table public.productos
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('spanish', coalesce(nombre, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(unidad, '')), 'C')
  ) stored;

create index if not exists idx_productos_search_vector
  on public.productos using gin (search_vector);

-- security invoker (por defecto): respeta las políticas RLS de productos,
-- así que solo devuelve productos aprobados y disponibles al público.
create or replace function public.search_productos(
  search_query text,
  price_min numeric default 0,
  price_max numeric default 999999999,
  disponible_only boolean default false
)
returns table (
  id uuid,
  nombre text,
  descripcion text,
  precio numeric,
  unidad text,
  disponible boolean,
  imagen_url text,
  emprendimiento_id uuid,
  created_at timestamptz,
  relevance real
)
language sql
stable
as $$
  select
    p.id, p.nombre, p.descripcion, p.precio, p.unidad, p.disponible,
    p.imagen_url, p.emprendimiento_id, p.created_at,
    (case
      when btrim(search_query) = '' then 0
      else ts_rank(p.search_vector, websearch_to_tsquery('spanish', search_query))
    end)::real
  from public.productos p
  where (
      btrim(search_query) = ''
      or p.search_vector @@ websearch_to_tsquery('spanish', search_query)
      or p.nombre ilike '%' || search_query || '%'
    )
    and p.precio between price_min and price_max
    and (not disponible_only or p.disponible)
  order by 10 desc, p.created_at desc
  limit 50;
$$;

create or replace view public.categoria_stats
with (security_invoker = true) as
select
  c.id,
  c.nombre as categoria,
  c.slug,
  count(p.id) as total_productos,
  coalesce(round(avg(p.precio), 2), 0) as precio_promedio,
  coalesce(min(p.precio), 0) as precio_minimo,
  coalesce(max(p.precio), 0) as precio_maximo
from public.categorias c
left join public.productos p on p.categoria_id = c.id and p.disponible
group by c.id, c.nombre, c.slug;
