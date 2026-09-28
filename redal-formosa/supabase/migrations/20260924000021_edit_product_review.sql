-- REDAL: editar productos sin saltear la moderación.
-- Hasta ahora protect_product_validation() congelaba validado/razon_rechazo en cualquier UPDATE del vendedor.
-- Al poder editar un producto (nombre, descripción, foto, precio, unidad) eso dejaba dos huecos:
--   1) un producto aprobado podía cambiarse a cualquier contenido sin que un admin lo viera;
--   2) un producto rechazado no tenía forma de volver a la cola después de corregirlo.
-- Regla nueva: si el vendedor cambia contenido visible (nombre, descripción o foto), el producto vuelve
-- "en revisión" (validado = false, sin motivo de rechazo). Precio, unidad y disponibilidad se cambian libremente.

create or replace function public.protect_product_validation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.validado := false;
      new.razon_rechazo := null;
    elsif (new.nombre, new.descripcion, new.imagen_url) is distinct from (old.nombre, old.descripcion, old.imagen_url) then
      new.validado := false;
      new.razon_rechazo := null;
    else
      new.validado := old.validado;
      new.razon_rechazo := old.razon_rechazo;
    end if;
  end if;
  return new;
end;
$$;
