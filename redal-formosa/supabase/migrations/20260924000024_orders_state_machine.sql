-- REDAL: los cambios de estado de un pedido solo pasan por funciones y por el sistema de pagos.
-- Hasta ahora las políticas UPDATE de pedidos dejaban que el comprador, el vendedor o el repartidor
-- editaran la fila directo por la API: un vendedor podía pasar su pedido de 'pagado' a 'entregado'
-- (y quedar listo para cobrar la liquidación sin entregar) y un comprador podía asignarse repartidor.
--
-- Los triggers NO son security definer: dentro de una función definer current_user sería el dueño y no
-- se distinguiría el origen.
-- Criterio: current_user distingue una sentencia directa del cliente ('authenticated' / 'anon') de una
-- función security definer (corre como su dueño) o del service role. Las funciones ya validan sus propias
-- transiciones; el trigger cubre lo que llegue directo.

-- ============ PEDIDOS ============

drop policy if exists "pedidos_update_productor" on public.pedidos;
drop policy if exists "pedidos_update_repartidor" on public.pedidos;
drop policy if exists "pedidos_update_comprador" on public.pedidos;

-- Lo único que el comprador hace directo es cancelar un pedido que todavía no pagó.
create policy "pedidos_cancelar_impago" on public.pedidos
  for update
  using (comprador_id = auth.uid() and estado = 'pendiente_pago')
  with check (comprador_id = auth.uid() and estado = 'cancelado');

create or replace function public.protect_pedido_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Funciones security definer y service role (webhook de pagos, reembolsos): confiables.
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;

  new.numero_pedido := old.numero_pedido;
  new.comprador_id := old.comprador_id;
  new.emprendimiento_id := old.emprendimiento_id;
  new.monto_total := old.monto_total;
  new.monto_envio := old.monto_envio;
  new.entrega_lat := old.entrega_lat;
  new.entrega_lng := old.entrega_lng;
  new.ubicacion_entrega := old.ubicacion_entrega;
  new.repartidor_id := old.repartidor_id;
  new.codigo_pin_entrega := old.codigo_pin_entrega;
  new.entregado_en := old.entregado_en;
  new.tipo_entrega := old.tipo_entrega;
  new.deleted_at := old.deleted_at;

  if new.estado is distinct from old.estado
     and not (old.estado = 'pendiente_pago' and new.estado = 'cancelado') then
    raise exception 'Ese cambio de estado no está permitido' using errcode = '22023';
  end if;
  return new;
end;
$$;

-- ============ REPARTIDORES ============
-- El repartidor edita su vehículo y su zona; tarifas, calificación, viajes y alta/baja son del sistema.

create or replace function public.protect_repartidor_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;
  new.user_id := old.user_id;
  new.tarifa_base := old.tarifa_base;
  new.tarifa_por_km := old.tarifa_por_km;
  new.calificacion_promedio := old.calificacion_promedio;
  new.viajes_completados := old.viajes_completados;
  new.activo := old.activo;
  new.deleted_at := old.deleted_at;
  return new;
end;
$$;

drop trigger if exists protect_repartidores_columns on public.repartidores;
create trigger protect_repartidores_columns
  before update on public.repartidores
  for each row execute function public.protect_repartidor_columns();

-- ============ VERIFICACIÓN DE IDENTIDAD ============
-- La persona sube sus documentos; el resultado de la revisión es del administrador.

create or replace function public.protect_validacion_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;
  new.user_id := old.user_id;
  new.estado := old.estado;
  new.similitud_porcentaje := old.similitud_porcentaje;
  new.rechazo_razon := old.rechazo_razon;
  new.deleted_at := old.deleted_at;
  return new;
end;
$$;

drop trigger if exists protect_validacion_columns on public.validacion_biometrica;
create trigger protect_validacion_columns
  before update on public.validacion_biometrica
  for each row execute function public.protect_validacion_columns();
