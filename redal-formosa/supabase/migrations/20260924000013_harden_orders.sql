-- REDAL: seguridad de pedidos.
-- Las políticas de UPDATE de pedidos no limitaban columnas: un comprador podía
-- cambiar el monto o marcar su propio pedido como pagado. Además, las políticas del
-- repartidor comparaban pedidos.repartidor_id (id de repartidores) con auth.uid().

drop policy if exists "pedidos_select_repartidor" on public.pedidos;
drop policy if exists "pedidos_update_repartidor" on public.pedidos;

create policy "pedidos_select_repartidor" on public.pedidos
  for select using (public.owns_repartidor(repartidor_id));

create policy "pedidos_update_repartidor" on public.pedidos
  for update using (public.owns_repartidor(repartidor_id));

-- Los pedidos se crean únicamente con crear_pedido(); no hay insert directo desde el cliente.
drop policy if exists "pedidos_insert_comprador" on public.pedidos;

create or replace function public.protect_pedido_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() es null para el service role (webhook de pagos): ese camino sí puede confirmar pagos.
  if auth.uid() is not null and not public.is_admin() then
    new.numero_pedido := old.numero_pedido;
    new.comprador_id := old.comprador_id;
    new.emprendimiento_id := old.emprendimiento_id;
    new.monto_total := old.monto_total;
    new.monto_envio := old.monto_envio;
    new.entrega_lat := old.entrega_lat;
    new.entrega_lng := old.entrega_lng;
    new.ubicacion_entrega := old.ubicacion_entrega;

    if new.estado is distinct from old.estado then
      -- Solo el sistema de pagos puede marcar un pedido como pagado.
      if new.estado = 'pagado' then
        new.estado := old.estado;
      -- Mientras no se pagó, lo único permitido es cancelarlo.
      elsif old.estado = 'pendiente_pago' and new.estado <> 'cancelado' then
        new.estado := old.estado;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_pedidos_columns on public.pedidos;
create trigger protect_pedidos_columns
  before update on public.pedidos
  for each row execute function public.protect_pedido_columns();

-- crear_pedido() es security definer, así que sigue pudiendo insertar.
