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
