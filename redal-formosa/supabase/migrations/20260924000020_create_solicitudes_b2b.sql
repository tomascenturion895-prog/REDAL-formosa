-- REDAL: solicitudes de cotización mayorista (canal B2B).
-- El formulario de /b2b no guardaba nada: mostraba "¡Solicitud recibida!" sin enviar la solicitud a ningún lado.
-- Ahora un comercio con sesión publica su pedido y los vendedores de la red lo ven en su panel para contactarlo.
--   - Las solicitudes caducan a los 30 días y cada persona puede tener hasta 3 abiertas.
--   - Solo se escribe mediante funciones (no hay políticas de insert/update/delete): la base valida y limita.
--   - Los datos de contacto los ven quien la creó, los vendedores (dueños de un emprendimiento) y los administradores.

create table if not exists public.solicitudes_b2b (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  razon_social text not null check (char_length(btrim(razon_social)) between 2 and 120),
  tipo_comercio text not null check (tipo_comercio in ('restaurante', 'verduleria', 'supermercado', 'hotel_catering', 'distribuidor', 'institucional')),
  localidad text not null check (char_length(btrim(localidad)) between 2 and 80),
  cuit text check (cuit is null or char_length(btrim(cuit)) between 11 and 13),
  contacto_nombre text not null check (char_length(btrim(contacto_nombre)) between 2 and 80),
  telefono text not null check (char_length(btrim(telefono)) between 6 and 30),
  productos text not null check (char_length(btrim(productos)) between 2 and 300),
  volumen text not null check (char_length(btrim(volumen)) between 2 and 200),
  frecuencia text not null check (frecuencia in ('semanal', 'quincenal', 'pedido_unico', 'programado')),
  mensaje text check (mensaje is null or char_length(mensaje) <= 500),
  estado text not null default 'abierta' check (estado in ('abierta', 'cerrada')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists solicitudes_b2b_user_idx on public.solicitudes_b2b (user_id, created_at desc);
create index if not exists solicitudes_b2b_abiertas_idx on public.solicitudes_b2b (created_at desc) where estado = 'abierta';

alter table public.solicitudes_b2b enable row level security;

create policy "solicitudes_b2b_select_own_or_admin" on public.solicitudes_b2b
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

grant select on public.solicitudes_b2b to authenticated;

-- ============ Crear ============

create or replace function public.crear_solicitud_b2b(
  p_razon_social text,
  p_tipo text,
  p_localidad text,
  p_cuit text,
  p_contacto text,
  p_telefono text,
  p_productos text,
  p_volumen text,
  p_frecuencia text,
  p_mensaje text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Tenés que iniciar sesión' using errcode = '42501';
  end if;

  if (select count(*) from public.solicitudes_b2b
        where user_id = auth.uid() and estado = 'abierta' and expires_at > now()) >= 3 then
    raise exception 'Ya tenés 3 solicitudes abiertas. Cerrá alguna para publicar otra.' using errcode = '22023';
  end if;

  insert into public.solicitudes_b2b (
    user_id, razon_social, tipo_comercio, localidad, cuit, contacto_nombre, telefono, productos, volumen, frecuencia, mensaje
  ) values (
    auth.uid(), btrim(p_razon_social), p_tipo, btrim(p_localidad), nullif(btrim(coalesce(p_cuit, '')), ''),
    btrim(p_contacto), btrim(p_telefono), btrim(p_productos), btrim(p_volumen), p_frecuencia,
    nullif(btrim(coalesce(p_mensaje, '')), '')
  ) returning id into v_id;

  return v_id;
end;
$$;

-- ============ Cerrar (solo quien la creó) ============

create or replace function public.cerrar_solicitud_b2b(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Tenés que iniciar sesión' using errcode = '42501';
  end if;

  update public.solicitudes_b2b set estado = 'cerrada'
  where id = p_id and user_id = auth.uid() and estado = 'abierta';

  if not found then
    raise exception 'Solicitud no encontrada' using errcode = '42501';
  end if;
end;
$$;

-- ============ Tablero del vendedor ============

create or replace function public.productor_solicitudes_b2b()
returns table (
  id uuid,
  razon_social text,
  tipo_comercio text,
  localidad text,
  contacto_nombre text,
  telefono text,
  productos text,
  volumen text,
  frecuencia text,
  mensaje text,
  created_at timestamptz,
  expires_at timestamptz
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
  if not public.is_admin() and not exists (select 1 from public.emprendimientos e where e.owner_id = auth.uid()) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
  select s.id, s.razon_social, s.tipo_comercio, s.localidad, s.contacto_nombre, s.telefono,
         s.productos, s.volumen, s.frecuencia, s.mensaje, s.created_at, s.expires_at
  from public.solicitudes_b2b s
  where s.estado = 'abierta' and s.expires_at > now()
  order by s.created_at desc
  limit 100;
end;
$$;

revoke all on function
  public.crear_solicitud_b2b(text, text, text, text, text, text, text, text, text, text),
  public.cerrar_solicitud_b2b(uuid),
  public.productor_solicitudes_b2b()
from public, anon;

grant execute on function
  public.crear_solicitud_b2b(text, text, text, text, text, text, text, text, text, text),
  public.cerrar_solicitud_b2b(uuid),
  public.productor_solicitudes_b2b()
to authenticated;
