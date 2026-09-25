-- El trigger de alta de usuarios corría sin security definer ni search_path: lo ejecuta el rol
-- supabase_auth_admin, que no ve el esquema public, y cada alta fallaba con
-- "Database error creating new user" (dashboard, /register, admin.createUser).
create or replace function public.crear_preferencias_notificaciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.preferencias_notificaciones (usuario_id)
  values (new.id)
  on conflict (usuario_id) do nothing;
  return new;
end;
$$;
