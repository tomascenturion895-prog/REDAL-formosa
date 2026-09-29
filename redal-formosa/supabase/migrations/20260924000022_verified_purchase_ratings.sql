-- REDAL: calificaciones solo de compras reales.
-- La política "Crear calificación" solo exigía que la calificación fuera de quien la escribe: cualquier cuenta
-- (incluido el propio vendedor) podía puntuar cualquier producto, sin haberlo comprado. Ahora hace falta tener un
-- pedido ENTREGADO que incluya el producto (o, para repartidores, una entrega hecha por esa persona).
-- Las calificaciones ya existentes se conservan.

create or replace function public.has_received_product(p_producto uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pedido_items i
    join public.pedidos p on p.id = i.pedido_id
    where i.producto_id = p_producto
      and p.comprador_id = auth.uid()
      and p.estado = 'entregado'
      and p.deleted_at is null
  );
$$;

create or replace function public.has_received_delivery(p_repartidor uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pedidos p
    where p.repartidor_id = p_repartidor
      and p.comprador_id = auth.uid()
      and p.estado = 'entregado'
      and p.deleted_at is null
  );
$$;

revoke all on function public.has_received_product(uuid), public.has_received_delivery(uuid) from public, anon;
grant execute on function public.has_received_product(uuid), public.has_received_delivery(uuid) to authenticated;

drop policy if exists "Crear calificación" on public.calificaciones;
create policy "Crear calificación" on public.calificaciones
  for insert to authenticated
  with check (
    auth.uid() = usuario_id
    and (producto_id is null or public.has_received_product(producto_id))
    and (repartidor_id is null or public.has_received_delivery(repartidor_id))
  );

-- Editar la propia calificación sigue permitido sin volver a comprobar la compra: no puede cambiar de producto.
drop policy if exists "Actualizar calificación propia" on public.calificaciones;
create policy "Actualizar calificación propia" on public.calificaciones
  for update to authenticated
  using (auth.uid() = usuario_id)
  with check (
    auth.uid() = usuario_id
    and (producto_id is null or public.has_received_product(producto_id))
    and (repartidor_id is null or public.has_received_delivery(repartidor_id))
  );
