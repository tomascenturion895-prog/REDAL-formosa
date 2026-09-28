-- REDAL: novedades de los emprendimientos.
-- Mensajes cortos que el vendedor publica (a mano o hablando) y que se ven en el inicio y en su perfil público.
-- Reemplaza al feed que se guardaba en un archivo local (data/posts.json) y no funcionaba en producción.

create table if not exists public.novedades (
  id uuid primary key default gen_random_uuid(),
  emprendimiento_id uuid not null references public.emprendimientos (id) on delete cascade,
  contenido text not null check (char_length(btrim(contenido)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists novedades_created_at_idx on public.novedades (created_at desc);
create index if not exists novedades_emprendimiento_idx on public.novedades (emprendimiento_id, created_at desc);

alter table public.novedades enable row level security;

-- Cualquiera lee las novedades de emprendimientos activos; el dueño también las de los suyos.
create policy "novedades_select" on public.novedades
  for select using (
    exists (
      select 1 from public.emprendimientos e
      where e.id = novedades.emprendimiento_id
        and e.deleted_at is null
        and (e.activo = true or e.owner_id = auth.uid())
    )
  );

create policy "novedades_insert_owner" on public.novedades
  for insert to authenticated with check (
    exists (
      select 1 from public.emprendimientos e
      where e.id = novedades.emprendimiento_id
        and e.owner_id = auth.uid()
        and e.deleted_at is null
    )
  );

-- El dueño borra las suyas; el administrador puede moderar cualquiera.
create policy "novedades_delete_owner_or_admin" on public.novedades
  for delete to authenticated using (
    public.is_admin()
    or exists (
      select 1 from public.emprendimientos e
      where e.id = novedades.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

grant select on public.novedades to anon, authenticated;
grant insert, delete on public.novedades to authenticated;
