-- Retoques a 026: la función del trigger que crea el código de entrega no debe poder invocarse por la API,
-- y pedido_monto_vendedor (023) no tenía search_path fijo. Ya aplicada en producción.
revoke execute on function public.crear_pin_pedido() from public, anon, authenticated;
alter function public.pedido_monto_vendedor(numeric, numeric, uuid) set search_path = public;
