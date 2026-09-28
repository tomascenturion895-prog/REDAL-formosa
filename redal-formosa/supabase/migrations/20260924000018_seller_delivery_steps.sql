-- REDAL: el vendedor puede cerrar el ciclo del pedido cuando entrega él mismo.
-- Hasta ahora productor_avanzar_pedido() se detenía en 'listo': si el emprendimiento reparte por su cuenta
-- (o el comprador retira), el pedido quedaba "listo" para siempre porque nadie podía marcarlo entregado.
-- Se agregan listo -> en_camino y en_camino -> entregado (con fecha de entrega).

create or replace function public.productor_avanzar_pedido(p_pedido_id uuid, p_estado public.order_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actual public.order_status;
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select p.estado into v_actual
  from public.pedidos p
  join public.emprendimientos e on e.id = p.emprendimiento_id
  where p.id = p_pedido_id and e.owner_id = auth.uid() and p.deleted_at is null
  for update of p;

  if not found then
    raise exception 'Pedido no encontrado' using errcode = '42501';
  end if;

  if not (
    (v_actual = 'pagado' and p_estado = 'en_preparacion') or
    (v_actual = 'en_preparacion' and p_estado = 'listo') or
    (v_actual = 'listo' and p_estado = 'en_camino') or
    (v_actual = 'en_camino' and p_estado = 'entregado')
  ) then
    raise exception 'Ese cambio de estado no está permitido' using errcode = '22023';
  end if;

  update public.pedidos
  set estado = p_estado,
      entregado_en = case when p_estado = 'entregado' then now() else entregado_en end
  where id = p_pedido_id;
end;
$$;

revoke all on function public.productor_avanzar_pedido(uuid, public.order_status) from public, anon;
grant execute on function public.productor_avanzar_pedido(uuid, public.order_status) to authenticated;
