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
