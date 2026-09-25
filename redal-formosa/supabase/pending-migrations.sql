-- REDAL: migraciones pendientes (02 a 14). Pegar completo en Supabase > SQL Editor y ejecutar una sola vez.
-- Las migraciones 00 y 01 ya estan aplicadas en el proyecto. Validado en Postgres 15 + PostGIS (14 migraciones + 24 escenarios).

-- ==================== 20260924000002_add_mercadopago_columns.sql ====================
-- Agregar columnas para MercadoPago en tabla pagos
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS referencia_externa TEXT,
ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Crear índice en referencia_externa para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pagos_referencia_externa ON pagos(referencia_externa);

-- Agregar columna resultado en validacion_biometrica para guardar resultado
ALTER TABLE validacion_biometrica
ADD COLUMN IF NOT EXISTS resultado JSONB;

-- Crear trigger para actualizar updated_at en pagos
CREATE OR REPLACE FUNCTION update_pagos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pagos_updated_at_trigger ON pagos;
CREATE TRIGGER update_pagos_updated_at_trigger
BEFORE UPDATE ON pagos
FOR EACH ROW
EXECUTE FUNCTION update_pagos_updated_at();


-- ==================== 20260924000003_add_tracking_columns.sql ====================
-- REDAL: seguimiento en tiempo real.
-- ubicaciones_tiempo_real guarda la última posición de cada repartidor. La app
-- escribe latitud/longitud; un trigger mantiene la columna geography sincronizada.

alter table public.ubicaciones_tiempo_real
  alter column ubicacion drop not null,
  add column if not exists latitud double precision,
  add column if not exists longitud double precision,
  add column if not exists exactitud numeric(8, 2),
  add column if not exists rumbo numeric(6, 2),
  add column if not exists actualizado_en timestamptz not null default now();

alter table public.ubicaciones_tiempo_real
  add constraint ubicaciones_repartidor_unica unique (repartidor_id);

create index if not exists idx_ubicaciones_actualizado_en
  on public.ubicaciones_tiempo_real (actualizado_en desc);

create or replace function public.sync_ubicacion()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  if new.latitud is not null and new.longitud is not null then
    new.ubicacion := st_setsrid(st_makepoint(new.longitud, new.latitud), 4326)::geography;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_ubicacion_trigger on public.ubicaciones_tiempo_real;
create trigger sync_ubicacion_trigger
  before insert or update on public.ubicaciones_tiempo_real
  for each row execute function public.sync_ubicacion();

-- ============ HELPERS DE AUTORIZACIÓN ============
-- pedidos consulta repartidores y repartidores consulta pedidos: si cada política
-- leyera la otra tabla directamente, Postgres detectaría recursión infinita.
-- Estas funciones (security definer) leen sin pasar por RLS y cortan el ciclo.

create or replace function public.owns_repartidor(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.repartidores where id = rid and user_id = auth.uid());
$$;

create or replace function public.is_buyer_of_repartidor(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pedidos where repartidor_id = rid and comprador_id = auth.uid()
  );
$$;

-- ============ POLÍTICAS ============
-- Las originales comparaban repartidor_id (id de la tabla repartidores) con auth.uid().

drop policy if exists "ubicaciones_insert_repartidor" on public.ubicaciones_tiempo_real;
drop policy if exists "ubicaciones_select_repartidor" on public.ubicaciones_tiempo_real;
drop policy if exists "ubicaciones_select_comprador" on public.ubicaciones_tiempo_real;

create policy "ubicaciones_insert_repartidor" on public.ubicaciones_tiempo_real
  for insert to authenticated
  with check (public.owns_repartidor(repartidor_id));

create policy "ubicaciones_update_repartidor" on public.ubicaciones_tiempo_real
  for update to authenticated
  using (public.owns_repartidor(repartidor_id));

create policy "ubicaciones_select_repartidor" on public.ubicaciones_tiempo_real
  for select to authenticated
  using (public.owns_repartidor(repartidor_id));

-- El comprador ve la ubicación del repartidor solo mientras su pedido está en camino.
create policy "ubicaciones_select_comprador" on public.ubicaciones_tiempo_real
  for select to authenticated
  using (
    exists (
      select 1 from public.pedidos p
      where p.repartidor_id = ubicaciones_tiempo_real.repartidor_id
        and p.comprador_id = auth.uid()
        and p.estado = 'en_camino'
    )
  );

-- Habilita postgres_changes (Realtime) para esta tabla.
do $$
begin
  alter publication supabase_realtime add table public.ubicaciones_tiempo_real;
exception
  when duplicate_object then null;
end;
$$;


-- ==================== 20260924000004_create_ratings_table.sql ====================
-- Crear tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  repartidor_id UUID REFERENCES repartidores(id) ON DELETE CASCADE,
  puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- se califica un producto o un repartidor, no ambos ni ninguno
  CONSTRAINT calificaciones_un_objetivo CHECK ((producto_id IS NOT NULL) <> (repartidor_id IS NOT NULL)),
  -- una calificación por persona y objetivo (se edita en lugar de duplicarse)
  CONSTRAINT calificaciones_unica_por_producto UNIQUE (usuario_id, producto_id),
  CONSTRAINT calificaciones_unica_por_repartidor UNIQUE (usuario_id, repartidor_id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_calificaciones_producto_id ON calificaciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_repartidor_id ON calificaciones(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_usuario_id ON calificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_creado_en ON calificaciones(creado_en DESC);

-- Crear vista para promedios de calificaciones de productos
CREATE OR REPLACE VIEW producto_ratings AS
SELECT
  p.id,
  COUNT(c.id) as total_ratings,
  ROUND(AVG(c.puntuacion)::numeric, 2) as promedio_puntuacion,
  MIN(c.puntuacion) as puntuacion_minima,
  MAX(c.puntuacion) as puntuacion_maxima
FROM productos p
LEFT JOIN calificaciones c ON p.id = c.producto_id
GROUP BY p.id;

-- Crear vista para promedios de calificaciones de repartidores
CREATE OR REPLACE VIEW repartidor_ratings AS
SELECT
  r.id,
  COUNT(c.id) as total_ratings,
  ROUND(AVG(c.puntuacion)::numeric, 2) as promedio_puntuacion,
  MIN(c.puntuacion) as puntuacion_minima,
  MAX(c.puntuacion) as puntuacion_maxima
FROM repartidores r
LEFT JOIN calificaciones c ON r.id = c.repartidor_id
GROUP BY r.id;

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_calificaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_calificaciones_updated_at_trigger ON calificaciones;
CREATE TRIGGER update_calificaciones_updated_at_trigger
BEFORE UPDATE ON calificaciones
FOR EACH ROW
EXECUTE FUNCTION update_calificaciones_updated_at();

-- RLS (Row Level Security)
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver todas las calificaciones
CREATE POLICY "Ver calificaciones" ON calificaciones
  FOR SELECT
  USING (true);

-- Usuarios pueden crear calificaciones para sí mismos
CREATE POLICY "Crear calificación" ON calificaciones
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Usuarios pueden actualizar sus propias calificaciones
CREATE POLICY "Actualizar calificación propia" ON calificaciones
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Usuarios pueden eliminar sus propias calificaciones
CREATE POLICY "Eliminar calificación propia" ON calificaciones
  FOR DELETE
  USING (auth.uid() = usuario_id);


-- ==================== 20260924000005_create_notifications_table.sql ====================
-- Crear tabla de notificaciones (auditoría)
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
  asunto VARCHAR(255),
  cuerpo TEXT NOT NULL,
  destinatario VARCHAR(255) NOT NULL, -- email o teléfono
  estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'enviado', 'fallido'
  intento_numero INTEGER DEFAULT 1,
  ultimo_error TEXT,
  referencia_externa VARCHAR(255), -- ID de SendGrid, Twilio, etc
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enviado_en TIMESTAMP WITH TIME ZONE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON notificaciones(estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_creado_en ON notificaciones(creado_en DESC);

-- Crear tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS preferencias_notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_confirmacion BOOLEAN DEFAULT true,
  email_estado_pedido BOOLEAN DEFAULT true,
  email_ofertas BOOLEAN DEFAULT true,
  sms_confirmacion BOOLEAN DEFAULT false,
  sms_estado_pedido BOOLEAN DEFAULT false,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve solo sus notificaciones
CREATE POLICY "Ver propias notificaciones" ON notificaciones
  FOR SELECT
  USING (auth.uid() = usuario_id);

-- Solo se puede registrar una notificación a nombre propio
CREATE POLICY "Crear propias notificaciones" ON notificaciones
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- RLS para preferencias
ALTER TABLE preferencias_notificaciones ENABLE ROW LEVEL SECURITY;

-- Usuarios ven/editan sus propias preferencias
CREATE POLICY "Ver propias preferencias" ON preferencias_notificaciones
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Actualizar propias preferencias" ON preferencias_notificaciones
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Crear propias preferencias" ON preferencias_notificaciones
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Función para crear preferencias por defecto
CREATE OR REPLACE FUNCTION crear_preferencias_notificaciones()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO preferencias_notificaciones (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear preferencias al registrarse
DROP TRIGGER IF EXISTS trigger_crear_preferencias ON auth.users;
CREATE TRIGGER trigger_crear_preferencias
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION crear_preferencias_notificaciones();


-- ==================== 20260924000006_add_admin_features.sql ====================
-- REDAL: panel de administración.
-- El rol admin vive en profiles.role (enum user_role). Todo acceso administrativo
-- pasa por funciones security definer que verifican is_admin(); no hay vistas abiertas.

-- ============ HELPER ============

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============ HARDENING DE PROFILES ============
-- profiles_update_own permitía que cualquiera se asignara role = 'admin'.

create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.verification_status := old.verification_status;
    new.verified_at := old.verified_at;
    -- La cuenta bancaria se guarda cifrada y solo la escribe el servidor (service role,
    -- donde auth.uid() es null). Un cliente no puede grabar texto plano por su cuenta.
    new.bank_account := old.bank_account;
    new.totp_secret := old.totp_secret;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profiles_privileged_columns on public.profiles;
create trigger protect_profiles_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- ============ MODERACION DE PRODUCTOS ============

alter table public.productos
  add column if not exists validado boolean not null default false,
  add column if not exists razon_rechazo text;

-- Los productos ya publicados quedan aprobados; los nuevos entran pendientes.
update public.productos set validado = true;

drop policy if exists "productos_select_public" on public.productos;
create policy "productos_select_public" on public.productos
  for select using (
    (disponible = true and validado = true)
    or exists (
      select 1 from public.emprendimientos e
      where e.id = productos.emprendimiento_id and e.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- Un productor no puede auto-aprobar sus productos.
create or replace function public.protect_product_validation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.validado := false;
      new.razon_rechazo := null;
    else
      new.validado := old.validado;
      new.razon_rechazo := old.razon_rechazo;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_productos_validation on public.productos;
create trigger protect_productos_validation
  before insert or update on public.productos
  for each row execute function public.protect_product_validation();

-- ============ AUDITORIA ============

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users (id) on delete set null,
  accion text not null,
  entidad text not null,
  entidad_id uuid,
  cambios jsonb,
  creado_en timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_admin_id on public.admin_audit_log (admin_id);
create index if not exists idx_admin_audit_log_creado_en on public.admin_audit_log (creado_en desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "audit_select_admin" on public.admin_audit_log;
create policy "audit_select_admin" on public.admin_audit_log
  for select using (public.is_admin());
-- Sin políticas de escritura: solo las funciones security definer insertan.

-- ============ FUNCIONES ADMINISTRATIVAS ============

create or replace function public.admin_get_stats()
returns table (
  total_usuarios bigint,
  total_productos bigint,
  total_pedidos bigint,
  total_calificaciones bigint,
  ingresos_totales numeric,
  pedidos_completados bigint,
  pedidos_en_entrega bigint
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
  select
    (select count(*) from public.profiles),
    (select count(*) from public.productos),
    (select count(*) from public.pedidos),
    (select count(*) from public.calificaciones),
    (select coalesce(sum(monto_total), 0) from public.pedidos
       where estado in ('pagado', 'en_preparacion', 'listo', 'en_camino', 'entregado')),
    (select count(*) from public.pedidos where estado = 'entregado'),
    (select count(*) from public.pedidos where estado = 'en_camino');
end;
$$;

create or replace function public.admin_pending_products()
returns table (
  id uuid,
  nombre text,
  descripcion text,
  precio numeric,
  unidad text,
  imagen_url text,
  created_at timestamptz,
  emprendimiento_nombre text,
  productor_email text
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
  select p.id, p.nombre, p.descripcion, p.precio, p.unidad, p.imagen_url, p.created_at,
         e.nombre, u.email::text
  from public.productos p
  join public.emprendimientos e on e.id = p.emprendimiento_id
  left join auth.users u on u.id = e.owner_id
  where p.validado = false and p.razon_rechazo is null
  order by p.created_at;
end;
$$;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role public.user_role,
  created_at timestamptz,
  cantidad_pedidos bigint
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
  select u.id, u.email::text, p.full_name, p.role, u.created_at,
         (select count(*) from public.pedidos o where o.comprador_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

create or replace function public.admin_review_product(
  product_id uuid,
  approve boolean,
  reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if not approve and (reason is null or btrim(reason) = '') then
    raise exception 'El rechazo requiere un motivo';
  end if;

  update public.productos
  set validado = approve,
      razon_rechazo = case when approve then null else reason end
  where id = product_id;

  insert into public.admin_audit_log (admin_id, accion, entidad, entidad_id, cambios)
  values (
    auth.uid(),
    case when approve then 'APROBAR_PRODUCTO' else 'RECHAZAR_PRODUCTO' end,
    'producto',
    product_id,
    jsonb_build_object('motivo', reason)
  );
end;
$$;

create or replace function public.admin_set_role(target_user uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if target_user = auth.uid() then
    raise exception 'No podés cambiar tu propio rol';
  end if;

  update public.profiles set role = new_role where id = target_user;

  insert into public.admin_audit_log (admin_id, accion, entidad, entidad_id, cambios)
  values (auth.uid(), 'CAMBIAR_ROL', 'usuario', target_user, jsonb_build_object('rol', new_role));
end;
$$;

revoke all on function
  public.admin_get_stats(),
  public.admin_pending_products(),
  public.admin_list_users(),
  public.admin_review_product(uuid, boolean, text),
  public.admin_set_role(uuid, public.user_role)
from public, anon;

grant execute on function
  public.admin_get_stats(),
  public.admin_pending_products(),
  public.admin_list_users(),
  public.admin_review_product(uuid, boolean, text),
  public.admin_set_role(uuid, public.user_role)
to authenticated;


-- ==================== 20260924000007_create_wishlist_table.sql ====================
-- Crear tabla de wishlist/favoritos
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

-- Índices
CREATE INDEX idx_wishlist_usuario ON wishlist(usuario_id);
CREATE INDEX idx_wishlist_producto ON wishlist(producto_id);

-- RLS Policies
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Los usuarios ven solo sus propios favoritos
CREATE POLICY "Usuarios ven sus favoritos"
  ON wishlist FOR SELECT
  USING (auth.uid() = usuario_id);

-- Los usuarios pueden agregar a favoritos
CREATE POLICY "Usuarios agregan favoritos"
  ON wishlist FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Los usuarios pueden remover de favoritos
CREATE POLICY "Usuarios removen favoritos"
  ON wishlist FOR DELETE
  USING (auth.uid() = usuario_id);

-- View para contar favoritos por producto
CREATE OR REPLACE VIEW producto_favoritos_count AS
SELECT
  p.id,
  COUNT(w.id) as total_favoritos
FROM productos p
LEFT JOIN wishlist w ON p.id = w.producto_id
GROUP BY p.id;


-- ==================== 20260924000008_add_full_text_search.sql ====================
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


-- ==================== 20260924000009_improve_order_views.sql ====================
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


-- ==================== 20260924000010_add_recommendations.sql ====================
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


-- ==================== 20260924000011_create_order_function.sql ====================
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


-- ==================== 20260924000012_storage_buckets.sql ====================
-- REDAL: buckets de Storage y sus políticas.
-- La app usaba dos buckets que no existían en la base, y el de DNI/selfie se leía
-- con URL pública. Los documentos de identidad quedan privados.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('biometric-verification', 'biometric-verification', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ============ product-images: lectura pública, escritura solo del dueño ============
-- Las rutas son "<emprendimiento_id>/<archivo>".

create policy "product_images_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_insert_owner" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.emprendimientos e
      where e.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  );

create policy "product_images_update_owner" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.emprendimientos e
      where e.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  );

create policy "product_images_delete_owner" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.emprendimientos e
      where e.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  );

-- ============ biometric-verification: privado ============
-- Las rutas son "<user_id>/<archivo>". Solo el titular y los admins pueden leer.

create policy "biometric_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'biometric-verification' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "biometric_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'biometric-verification' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "biometric_select_own_or_admin" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'biometric-verification'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- Una sola ficha de verificación por usuario (antes cada archivo creaba una fila nueva).
alter table public.validacion_biometrica
  add constraint validacion_biometrica_user_unica unique (user_id);


-- ==================== 20260924000013_harden_orders.sql ====================
-- REDAL: seguridad de pedidos.
-- Las políticas de UPDATE de pedidos no limitaban columnas: un comprador podía
-- cambiar el monto o marcar su propio pedido como pagado. Además, las políticas del
-- repartidor comparaban pedidos.repartidor_id (id de repartidores) con auth.uid().

drop policy if exists "pedidos_select_repartidor" on public.pedidos;
drop policy if exists "pedidos_update_repartidor" on public.pedidos;

create policy "pedidos_select_repartidor" on public.pedidos
  for select using (public.owns_repartidor(repartidor_id));

create policy "pedidos_update_repartidor" on public.pedidos
  for update using (public.owns_repartidor(repartidor_id));

-- Los pedidos se crean únicamente con crear_pedido(); no hay insert directo desde el cliente.
drop policy if exists "pedidos_insert_comprador" on public.pedidos;

create or replace function public.protect_pedido_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() es null para el service role (webhook de pagos): ese camino sí puede confirmar pagos.
  if auth.uid() is not null and not public.is_admin() then
    new.numero_pedido := old.numero_pedido;
    new.comprador_id := old.comprador_id;
    new.emprendimiento_id := old.emprendimiento_id;
    new.monto_total := old.monto_total;
    new.monto_envio := old.monto_envio;
    new.entrega_lat := old.entrega_lat;
    new.entrega_lng := old.entrega_lng;
    new.ubicacion_entrega := old.ubicacion_entrega;

    if new.estado is distinct from old.estado then
      -- Solo el sistema de pagos puede marcar un pedido como pagado.
      if new.estado = 'pagado' then
        new.estado := old.estado;
      -- Mientras no se pagó, lo único permitido es cancelarlo.
      elsif old.estado = 'pendiente_pago' and new.estado <> 'cancelado' then
        new.estado := old.estado;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_pedidos_columns on public.pedidos;
create trigger protect_pedidos_columns
  before update on public.pedidos
  for each row execute function public.protect_pedido_columns();

-- crear_pedido() es security definer, así que sigue pudiendo insertar.


-- ==================== 20260924000014_privacy_profiles_repartidores.sql ====================
-- REDAL: privacidad de datos personales.
-- profiles_select_public (using true) dejaba leer a cualquiera, incluso sin sesión,
-- el teléfono, la cuenta bancaria y el secreto TOTP de todos los usuarios.
-- repartidores_select_public exponía patente y ubicación en vivo de cada repartidor.

-- ============ profiles: cada persona ve la suya; el admin ve todas ============

drop policy if exists "profiles_select_public" on public.profiles;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- ============ repartidores: solo el titular, el admin o el comprador de un pedido asignado ============

drop policy if exists "repartidores_select_public" on public.repartidores;

create policy "repartidores_select_own_or_admin" on public.repartidores
  for select using (user_id = auth.uid() or public.is_admin());

-- is_buyer_of_repartidor() (migración 03) evita la recursión entre pedidos y repartidores.
create policy "repartidores_select_buyer" on public.repartidores
  for select using (public.is_buyer_of_repartidor(id));

