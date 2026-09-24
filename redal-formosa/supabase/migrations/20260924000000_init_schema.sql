-- REDAL: esquema inicial
-- Emprendimientos, productos, categorias, contactos y resenas.

create extension if not exists "pgcrypto";

-- ============ ENUMS ============

create type public.user_role as enum ('comprador', 'emprendedor', 'admin');
create type public.contacto_estado as enum ('pendiente', 'contactado', 'cerrado');

-- ============ FUNCIONES DE SOPORTE ============

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ PROFILES ============
-- Extiende auth.users con datos propios de la app.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'comprador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea automáticamente el profile cuando se registra un usuario en auth.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ CATEGORIAS ============

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ============ EMPRENDIMIENTOS ============

create table public.emprendimientos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  nombre text not null,
  descripcion text,
  telefono text,
  email text,
  direccion text,
  latitud double precision,
  longitud double precision,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index emprendimientos_owner_id_idx on public.emprendimientos (owner_id);
create index emprendimientos_ubicacion_idx on public.emprendimientos (latitud, longitud);

create trigger set_emprendimientos_updated_at
  before update on public.emprendimientos
  for each row execute function public.set_updated_at();

-- ============ PRODUCTOS ============

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  emprendimiento_id uuid not null references public.emprendimientos (id) on delete cascade,
  categoria_id uuid references public.categorias (id) on delete set null,
  nombre text not null,
  descripcion text,
  precio numeric(12, 2) not null check (precio >= 0),
  unidad text not null default 'unidad',
  imagen_url text,
  disponible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index productos_emprendimiento_id_idx on public.productos (emprendimiento_id);
create index productos_categoria_id_idx on public.productos (categoria_id);

create trigger set_productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

-- ============ CONTACTOS (solicitudes comprador -> emprendimiento) ============

create table public.contactos (
  id uuid primary key default gen_random_uuid(),
  comprador_id uuid references public.profiles (id) on delete set null,
  emprendimiento_id uuid not null references public.emprendimientos (id) on delete cascade,
  producto_id uuid references public.productos (id) on delete set null,
  mensaje text not null,
  estado public.contacto_estado not null default 'pendiente',
  created_at timestamptz not null default now()
);

create index contactos_emprendimiento_id_idx on public.contactos (emprendimiento_id);
create index contactos_comprador_id_idx on public.contactos (comprador_id);

-- ============ RESENAS ============

create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.profiles (id) on delete cascade,
  emprendimiento_id uuid not null references public.emprendimientos (id) on delete cascade,
  calificacion smallint not null check (calificacion between 1 and 5),
  comentario text,
  created_at timestamptz not null default now(),
  unique (autor_id, emprendimiento_id)
);

create index resenas_emprendimiento_id_idx on public.resenas (emprendimiento_id);

-- ============ ROW LEVEL SECURITY ============

alter table public.profiles enable row level security;
alter table public.categorias enable row level security;
alter table public.emprendimientos enable row level security;
alter table public.productos enable row level security;
alter table public.contactos enable row level security;
alter table public.resenas enable row level security;

-- profiles: visibles para todos, editables solo por su dueño.
create policy "profiles_select_public" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- categorias: catalogo publico de solo lectura (se administra fuera de la app).
create policy "categorias_select_public" on public.categorias
  for select using (true);

-- emprendimientos: publicos si estan activos; el dueño ve y gestiona los suyos siempre.
create policy "emprendimientos_select_public" on public.emprendimientos
  for select using (activo = true or owner_id = auth.uid());

create policy "emprendimientos_insert_own" on public.emprendimientos
  for insert with check (owner_id = auth.uid());

create policy "emprendimientos_update_own" on public.emprendimientos
  for update using (owner_id = auth.uid());

create policy "emprendimientos_delete_own" on public.emprendimientos
  for delete using (owner_id = auth.uid());

-- productos: publicos si estan disponibles; el dueño del emprendimiento gestiona los suyos.
create policy "productos_select_public" on public.productos
  for select using (
    disponible = true
    or exists (
      select 1 from public.emprendimientos e
      where e.id = productos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

create policy "productos_insert_owner" on public.productos
  for insert with check (
    exists (
      select 1 from public.emprendimientos e
      where e.id = productos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

create policy "productos_update_owner" on public.productos
  for update using (
    exists (
      select 1 from public.emprendimientos e
      where e.id = productos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

create policy "productos_delete_owner" on public.productos
  for delete using (
    exists (
      select 1 from public.emprendimientos e
      where e.id = productos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

-- contactos: visibles para el comprador que lo inicio y el dueño del emprendimiento.
create policy "contactos_select_involved" on public.contactos
  for select using (
    comprador_id = auth.uid()
    or exists (
      select 1 from public.emprendimientos e
      where e.id = contactos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

create policy "contactos_insert_authenticated" on public.contactos
  for insert with check (comprador_id = auth.uid());

create policy "contactos_update_owner" on public.contactos
  for update using (
    exists (
      select 1 from public.emprendimientos e
      where e.id = contactos.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

-- resenas: publicas para lectura; solo el autor gestiona la suya.
create policy "resenas_select_public" on public.resenas
  for select using (true);

create policy "resenas_insert_own" on public.resenas
  for insert with check (autor_id = auth.uid());

create policy "resenas_update_own" on public.resenas
  for update using (autor_id = auth.uid());

create policy "resenas_delete_own" on public.resenas
  for delete using (autor_id = auth.uid());
