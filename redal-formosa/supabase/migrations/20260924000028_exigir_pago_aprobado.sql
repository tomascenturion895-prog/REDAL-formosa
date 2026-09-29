-- Un pedido solo puede pasar a «pagado» si tiene un pago aprobado registrado.
--
-- El único camino previsto es el webhook de Mercado Pago (que primero marca el pago como aprobado y
-- después el pedido). Esta regla lo garantiza en la base: ni un administrador ni un error futuro en el
-- código pueden dejar un pedido en preparación sin que el dinero haya llegado. Un pago pendiente
-- (efectivo, transferencia o ticket de Mercado Pago sin acreditar) deja el pedido en «pendiente_pago».
create or replace function public.exigir_pago_aprobado()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.estado = 'pagado' and old.estado is distinct from 'pagado' then
    if not exists (
      select 1 from public.pagos g
      where g.pedido_id = new.id and g.estado in ('aprobado', 'en_custodia', 'liquidado')
    ) then
      raise exception 'El pedido no tiene un pago aprobado' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists exigir_pago_aprobado on public.pedidos;
create trigger exigir_pago_aprobado
  before update of estado on public.pedidos
  for each row execute function public.exigir_pago_aprobado();

revoke execute on function public.exigir_pago_aprobado() from public, anon, authenticated;
