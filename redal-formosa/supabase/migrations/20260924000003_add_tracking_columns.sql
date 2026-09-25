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
