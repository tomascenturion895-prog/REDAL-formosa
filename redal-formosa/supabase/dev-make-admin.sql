-- SOLO PARA PRUEBAS. No es una migración: se ejecuta a mano en el SQL Editor de Supabase.
--
-- 1. Registrá la cuenta desde la app (/register) y confirmá el email si corresponde.
-- 2. Cambiá el email de abajo por el de esa cuenta y ejecutá este script.
-- 3. Cerrá sesión y volvé a ingresar: aparece "Panel de administración" en el menú (/admin).
--
-- En el SQL Editor auth.uid() es null, por eso el trigger protect_profile_privileged_columns
-- permite el cambio de rol. Desde la app, nadie puede asignarse admin.

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'tu-email@ejemplo.com');

-- Verificación: debe devolver una fila con role = admin.
select u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';

-- Para volver a comprador:
-- update public.profiles set role = 'comprador' where id = (select id from auth.users where email = 'tu-email@ejemplo.com');
