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
