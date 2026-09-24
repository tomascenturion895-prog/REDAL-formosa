-- REDAL: Expansión de schema para pedidos, biometría, repartidores, tracking y pagos
-- Implementa todos los requisitos funcionales del SDD

-- ============ ENUMS ============

create type public.verification_status as enum ('pendiente', 'approved', 'rejected', 'pending_review');
create type public.order_status as enum ('pendiente_pago', 'pagado', 'en_preparacion', 'listo', 'en_camino', 'entregado', 'cancelado');
create type public.delivery_status as enum ('aceptado', 'en_camino', 'entregado', 'cancelado', 'fallido');
create type public.payment_status as enum ('pendiente', 'aprobado', 'en_custodia', 'liquidado', 'fallido', 'reembolsado');
create type public.vehicle_type as enum ('bicicleta', 'moto', 'auto', 'camion');

-- ============ EXTENSIONES ============

create extension if not exists "postgis";

-- ============ EXPANDIR PROFILES ============

alter table public.profiles
add column verification_status public.verification_status not null default 'pendiente',
add column verified_at timestamptz,
add column totp_secret text,
add column bank_account text,
add column deleted_at timestamptz;

create index profiles_verification_status_idx on public.profiles (verification_status);
create index profiles_deleted_at_idx on public.profiles (deleted_at);

-- ============ EXPANDIR EMPRENDIMIENTOS ============

alter table public.emprendimientos
add column horario_apertura time,
add column horario_cierre time,
add column comision_repartidor numeric(5, 2) default 15,
add column deleted_at timestamptz,
add column ubicacion geography(point, 4326);

create index emprendimientos_deleted_at_idx on public.emprendimientos (deleted_at);
create index emprendimientos_ubicacion_geo_idx on public.emprendimientos using gist (ubicacion);

-- ============ VALIDACION BIOMETRICA ============

create table public.validacion_biometrica (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  dni_frente_url text,
  dni_reverso_url text,
  dni_datos jsonb,
  selfie_url text,
  embedding_dni bytea,
  embedding_selfie bytea,
  similitud_porcentaje numeric(5, 2),
  estado public.verification_status not null default 'pendiente',
  rechazo_razon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index validacion_biometrica_user_id_idx on public.validacion_biometrica (user_id);
create index validacion_biometrica_estado_idx on public.validacion_biometrica (estado);
create index validacion_biometrica_created_at_idx on public.validacion_biometrica (created_at desc);

create trigger set_validacion_biometrica_updated_at
  before update on public.validacion_biometrica
  for each row execute function public.set_updated_at();

-- ============ REPARTIDORES ============

create table public.repartidores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  tipo_vehiculo public.vehicle_type not null,
  placa_vehiculo text,
  tarifa_base numeric(10, 2) not null default 50,
  tarifa_por_km numeric(10, 2) not null default 5,
  zona_cobertura_radio_km numeric(5, 2) default 15,
  activo boolean not null default true,
  ubicacion_ultima geography(point, 4326),
  ubicacion_actualizado_at timestamptz,
  calificacion_promedio numeric(3, 2),
  viajes_completados integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index repartidores_user_id_idx on public.repartidores (user_id);
create index repartidores_activo_idx on public.repartidores (activo);
create index repartidores_ubicacion_ultima_idx on public.repartidores using gist (ubicacion_ultima);
create index repartidores_deleted_at_idx on public.repartidores (deleted_at);

create trigger set_repartidores_updated_at
  before update on public.repartidores
  for each row execute function public.set_updated_at();

-- ============ PEDIDOS ============

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero_pedido text not null unique,
  comprador_id uuid not null references public.profiles (id) on delete restrict,
  emprendimiento_id uuid not null references public.emprendimientos (id) on delete restrict,
  repartidor_id uuid references public.repartidores (id) on delete set null,
  estado public.order_status not null default 'pendiente_pago',
  tipo_entrega text not null,
  direccion_entrega text,
  ubicacion_entrega geography(point, 4326),
  monto_total numeric(12, 2) not null,
  monto_envio numeric(12, 2) default 0,
  distancia_km numeric(8, 2),
  nota_cliente text,
  codigo_pin_entrega text,
  entregado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index pedidos_comprador_id_idx on public.pedidos (comprador_id);
create index pedidos_emprendimiento_id_idx on public.pedidos (emprendimiento_id);
create index pedidos_repartidor_id_idx on public.pedidos (repartidor_id);
create index pedidos_estado_idx on public.pedidos (estado);
create index pedidos_numero_pedido_idx on public.pedidos (numero_pedido);
create index pedidos_created_at_idx on public.pedidos (created_at desc);
create index pedidos_deleted_at_idx on public.pedidos (deleted_at);

create trigger set_pedidos_updated_at
  before update on public.pedidos
  for each row execute function public.set_updated_at();

-- ============ PEDIDO ITEMS ============

create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  producto_id uuid not null references public.productos (id) on delete restrict,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index pedido_items_pedido_id_idx on public.pedido_items (pedido_id);
create index pedido_items_producto_id_idx on public.pedido_items (producto_id);

-- ============ PAGOS (MercadoPago) ============

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null unique references public.pedidos (id) on delete restrict,
  monto numeric(12, 2) not null,
  estado public.payment_status not null default 'pendiente',
  proveedor text not null default 'mercadopago',
  transaccion_id text,
  preferencia_mp_id text,
  webhook_response jsonb,
  retenido_hasta timestamptz,
  liquidado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pagos_pedido_id_idx on public.pagos (pedido_id);
create index pagos_estado_idx on public.pagos (estado);
create index pagos_transaccion_id_idx on public.pagos (transaccion_id);
create index pagos_created_at_idx on public.pagos (created_at desc);

create trigger set_pagos_updated_at
  before update on public.pagos
  for each row execute function public.set_updated_at();

-- ============ INTENTOS ENTREGA ============

create table public.intentos_entrega (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  repartidor_id uuid not null references public.repartidores (id) on delete restrict,
  estado public.delivery_status not null default 'aceptado',
  distancia_estimada_km numeric(8, 2),
  tiempo_estimado_min integer,
  razon_fallo text,
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index intentos_entrega_pedido_id_idx on public.intentos_entrega (pedido_id);
create index intentos_entrega_repartidor_id_idx on public.intentos_entrega (repartidor_id);
create index intentos_entrega_estado_idx on public.intentos_entrega (estado);
create index intentos_entrega_created_at_idx on public.intentos_entrega (created_at desc);

create trigger set_intentos_entrega_updated_at
  before update on public.intentos_entrega
  for each row execute function public.set_updated_at();

-- ============ UBICACIONES EN TIEMPO REAL (GPS Tracking) ============

create table public.ubicaciones_tiempo_real (
  id uuid primary key default gen_random_uuid(),
  repartidor_id uuid not null references public.repartidores (id) on delete cascade,
  pedido_id uuid references public.pedidos (id) on delete set null,
  ubicacion geography(point, 4326) not null,
  velocidad numeric(5, 2),
  precision_metros numeric(8, 2),
  created_at timestamptz not null default now()
);

create index ubicaciones_tiempo_real_repartidor_id_idx on public.ubicaciones_tiempo_real (repartidor_id);
create index ubicaciones_tiempo_real_pedido_id_idx on public.ubicaciones_tiempo_real (pedido_id);
create index ubicaciones_tiempo_real_created_at_idx on public.ubicaciones_tiempo_real (created_at desc);
create index ubicaciones_tiempo_real_ubicacion_idx on public.ubicaciones_tiempo_real using gist (ubicacion);

-- ============ ROW LEVEL SECURITY ============

alter table public.validacion_biometrica enable row level security;
alter table public.repartidores enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;
alter table public.pagos enable row level security;
alter table public.intentos_entrega enable row level security;
alter table public.ubicaciones_tiempo_real enable row level security;

-- validacion_biometrica: el usuario ve su propia validación; admins ven todas
create policy "validacion_biometrica_select_own" on public.validacion_biometrica
  for select using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "validacion_biometrica_insert_own" on public.validacion_biometrica
  for insert with check (user_id = auth.uid());

create policy "validacion_biometrica_update_own" on public.validacion_biometrica
  for update using (user_id = auth.uid());

-- repartidores: cualquiera puede ver activos; cada repartidor ve/edita sus datos
create policy "repartidores_select_public" on public.repartidores
  for select using (activo = true or user_id = auth.uid());

create policy "repartidores_update_own" on public.repartidores
  for update using (user_id = auth.uid());

create policy "repartidores_delete_own" on public.repartidores
  for delete using (user_id = auth.uid());

-- pedidos: comprador, productor y repartidor ven los pedidos relevantes
create policy "pedidos_select_comprador" on public.pedidos
  for select using (comprador_id = auth.uid());

create policy "pedidos_select_productor" on public.pedidos
  for select using (
    exists (
      select 1 from public.emprendimientos e
      where e.id = pedidos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

create policy "pedidos_select_repartidor" on public.pedidos
  for select using (repartidor_id = auth.uid());

create policy "pedidos_insert_comprador" on public.pedidos
  for insert with check (comprador_id = auth.uid());

create policy "pedidos_update_comprador" on public.pedidos
  for update using (comprador_id = auth.uid());

create policy "pedidos_update_productor" on public.pedidos
  for update using (
    exists (
      select 1 from public.emprendimientos e
      where e.id = pedidos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

create policy "pedidos_update_repartidor" on public.pedidos
  for update using (repartidor_id = auth.uid());

-- pedido_items: heredan visibilidad del pedido
create policy "pedido_items_select" on public.pedido_items
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_items.pedido_id
      and (
        p.comprador_id = auth.uid()
        or exists (
          select 1 from public.emprendimientos e
          where e.id = p.emprendimiento_id and e.owner_id = auth.uid()
        )
        or p.repartidor_id = auth.uid()
      )
    )
  );

-- pagos: comprador y productor ven los pagos de sus pedidos
create policy "pagos_select" on public.pagos
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = pagos.pedido_id
      and (
        p.comprador_id = auth.uid()
        or exists (
          select 1 from public.emprendimientos e
          where e.id = p.emprendimiento_id and e.owner_id = auth.uid()
        )
      )
    )
  );

-- intentos_entrega: repartidor, comprador y productor ven
create policy "intentos_entrega_select_repartidor" on public.intentos_entrega
  for select using (repartidor_id = auth.uid());

create policy "intentos_entrega_select_comprador" on public.intentos_entrega
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = intentos_entrega.pedido_id and p.comprador_id = auth.uid()
    )
  );

create policy "intentos_entrega_select_productor" on public.intentos_entrega
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = intentos_entrega.pedido_id
      and exists (
        select 1 from public.emprendimientos e
        where e.id = p.emprendimiento_id and e.owner_id = auth.uid()
      )
    )
  );

create policy "intentos_entrega_update_repartidor" on public.intentos_entrega
  for update using (repartidor_id = auth.uid());

-- ubicaciones_tiempo_real: repartidor reporta; comprador ve su envío
create policy "ubicaciones_insert_repartidor" on public.ubicaciones_tiempo_real
  for insert with check (repartidor_id = auth.uid());

create policy "ubicaciones_select_repartidor" on public.ubicaciones_tiempo_real
  for select using (repartidor_id = auth.uid());

create policy "ubicaciones_select_comprador" on public.ubicaciones_tiempo_real
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = ubicaciones_tiempo_real.pedido_id and p.comprador_id = auth.uid()
    )
  );
