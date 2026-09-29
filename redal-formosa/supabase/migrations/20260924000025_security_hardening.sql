-- Endurecimiento de la base tras la auditoría de septiembre.
--
-- Todo lo de acá es aditivo o restrictivo y se puede volver a ejecutar. Las restricciones CHECK se crean
-- NOT VALID: se aplican a filas nuevas o modificadas sin frenar la migración por datos históricos.
--
-- Fuera de alcance a propósito:
--  * security_invoker en producto_ratings / repartidor_ratings / producto_favoritos_count: esas vistas
--    agregan filas que la RLS oculta (calificaciones y favoritos ajenos); con security_invoker los
--    promedios públicos dejarían de verse. Solo exponen conteos por id.
--  * Envolver auth.uid() en (select auth.uid()) en las ~44 políticas: es una optimización de rendimiento
--    que conviene hacer con datos reales y en su propia migración.

-- ============ EMPRENDIMIENTOS ============
-- El dueño edita los datos de su emprendimiento; darlo de baja o reactivarlo, cambiar de dueño y la
-- comisión son del sistema. Antes un PATCH directo permitía reactivar un emprendimiento dado de baja.

create or replace function public.protect_emprendimiento_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;
  new.owner_id := old.owner_id;
  new.activo := old.activo;
  new.deleted_at := old.deleted_at;
  new.comision_repartidor := old.comision_repartidor;
  return new;
end;
$$;

drop trigger if exists protect_emprendimientos_columns on public.emprendimientos;
create trigger protect_emprendimientos_columns
  before update on public.emprendimientos
  for each row execute function public.protect_emprendimiento_columns();

-- ============ REPARTIDORES ============
-- La baja es administrativa. Con esta política un repartidor podía borrar su fila y, por el CASCADE,
-- sus calificaciones (y volver a darse de alta con la reputación en cero).

drop policy if exists "repartidores_delete_own" on public.repartidores;

-- Un comprador solo ve la ficha (patente, ubicación) del repartidor mientras su pedido está en reparto
-- o hasta dos horas después de la entrega; antes la conservaba para siempre.
create or replace function public.is_buyer_of_repartidor(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pedidos
    where repartidor_id = rid
      and comprador_id = auth.uid()
      and (
        estado in ('listo', 'en_camino')
        or (estado = 'entregado' and updated_at > now() - interval '2 hours')
      )
  );
$$;

-- ============ VERIFICACIÓN DE IDENTIDAD ============
-- Nadie se inserta una verificación ya aprobada, y cambiar un documento vuelve la ficha a revisión.

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
  new.similitud_porcentaje := old.similitud_porcentaje;
  new.rechazo_razon := old.rechazo_razon;
  new.deleted_at := old.deleted_at;
  new.embedding_dni := old.embedding_dni;
  new.embedding_selfie := old.embedding_selfie;
  new.dni_datos := old.dni_datos;
  if new.dni_frente_url is distinct from old.dni_frente_url
     or new.dni_reverso_url is distinct from old.dni_reverso_url
     or new.selfie_url is distinct from old.selfie_url then
    -- Documento nuevo: vuelve a la cola del administrador.
    new.estado := 'pendiente';
    new.similitud_porcentaje := null;
    new.rechazo_razon := null;
  else
    new.estado := old.estado;
  end if;
  return new;
end;
$$;

create or replace function public.protect_validacion_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;
  new.estado := 'pendiente';
  new.similitud_porcentaje := null;
  new.rechazo_razon := null;
  new.embedding_dni := null;
  new.embedding_selfie := null;
  new.dni_datos := null;
  new.deleted_at := null;
  return new;
end;
$$;

drop trigger if exists protect_validacion_insert on public.validacion_biometrica;
create trigger protect_validacion_insert
  before insert on public.validacion_biometrica
  for each row execute function public.protect_validacion_insert();

-- ============ PEDIDOS ============
-- crear_pedido validaba producto pero no el emprendimiento: se podía comprar en uno dado de baja.
-- También se limita la cantidad de pedidos sin pagar abiertos por comprador.

create or replace function public.check_pedido_nuevo()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_ok boolean;
  v_abiertos int;
begin
  select (activo and deleted_at is null) into v_ok from public.emprendimientos where id = new.emprendimiento_id;
  if v_ok is distinct from true then
    raise exception 'Este emprendimiento no está recibiendo pedidos por ahora';
  end if;

  select count(*) into v_abiertos
  from public.pedidos
  where comprador_id = new.comprador_id and estado = 'pendiente_pago';
  if v_abiertos >= 10 then
    raise exception 'Tenés demasiados pedidos sin pagar. Pagá o cancelá alguno antes de hacer otro.';
  end if;

  return new;
end;
$$;

drop trigger if exists check_pedido_nuevo on public.pedidos;
create trigger check_pedido_nuevo
  before insert on public.pedidos
  for each row execute function public.check_pedido_nuevo();

-- ============ RESEÑAS DE EMPRENDIMIENTOS ============
-- Igual que las calificaciones de producto (022): solo quien recibió un pedido de ese emprendimiento,
-- y nunca sobre el propio.

drop policy if exists "resenas_insert_own" on public.resenas;
create policy "resenas_insert_own" on public.resenas
  for insert with check (
    autor_id = auth.uid()
    and exists (
      select 1 from public.pedidos p
      where p.comprador_id = auth.uid()
        and p.emprendimiento_id = resenas.emprendimiento_id
        and p.estado = 'entregado'
    )
    and not exists (
      select 1 from public.emprendimientos e
      where e.id = resenas.emprendimiento_id and e.owner_id = auth.uid()
    )
  );

-- ============ NOTIFICACIONES ============
-- Las escribe el servidor con service role; la política permitía a cualquiera forjar su propio historial.

drop policy if exists "Crear propias notificaciones" on public.notificaciones;

-- ============ STORAGE ============
-- Las políticas de UPDATE no validaban el objeto nuevo: se podía renombrar a la carpeta de otra persona.

drop policy if exists "product_images_update_owner" on storage.objects;
create policy "product_images_update_owner" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.emprendimientos e
      where e.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.emprendimientos e
      where e.id::text = (storage.foldername(name))[1] and e.owner_id = auth.uid()
    )
  );

drop policy if exists "biometric_update_own" on storage.objects;
create policy "biometric_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'biometric-verification' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'biometric-verification' and (storage.foldername(name))[1] = auth.uid()::text);

-- Derecho de supresión (Ley 25.326): la persona puede borrar sus propios documentos.
drop policy if exists "biometric_delete_own" on storage.objects;
create policy "biometric_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'biometric-verification' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============ FUNCIONES ============
-- Funciones de trigger y de sistema que no deben poder invocarse por la API REST. (Las que usan las
-- políticas RLS, como is_admin, quedan ejecutables: las evalúa el rol que consulta.)

do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in (
        'crear_preferencias_notificaciones', 'handle_new_user',
        'protect_pedido_columns', 'protect_product_validation', 'protect_profile_privileged_columns',
        'protect_repartidor_columns', 'protect_validacion_columns', 'protect_validacion_insert',
        'protect_emprendimiento_columns', 'check_pedido_nuevo'
      )
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn);
  end loop;
end $$;

-- search_path fijo en las funciones que no lo tenían (aviso «function_search_path_mutable»).
do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in (
        'search_productos', 'update_calificaciones_updated_at', 'calcular_envio',
        'recomendaciones_usuario', 'update_pagos_updated_at', 'set_updated_at', 'sync_ubicacion'
      )
  loop
    execute format('alter function %s set search_path = public', fn);
  end loop;
end $$;

-- Más vendidos es público: se acota el tamaño de la respuesta.
create or replace function public.productos_mas_vendidos(max_results int default 8)
returns table (
  producto_id uuid,
  nombre text,
  precio numeric,
  imagen_url text,
  veces_comprado bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.nombre, p.precio, p.imagen_url, count(distinct i.pedido_id)
  from public.pedido_items i
  join public.pedidos o on o.id = i.pedido_id
  join public.productos p on p.id = i.producto_id
  where o.estado in ('pagado', 'en_preparacion', 'listo', 'en_camino', 'entregado')
    and p.disponible and p.validado
  group by p.id, p.nombre, p.precio, p.imagen_url
  order by count(distinct i.pedido_id) desc
  limit least(greatest(coalesce(max_results, 8), 1), 50);
$$;

-- ============ INTEGRIDAD ============

alter table public.pedidos
  drop constraint if exists pedidos_montos_no_negativos,
  add constraint pedidos_montos_no_negativos check (monto_total >= 0 and coalesce(monto_envio, 0) >= 0) not valid;

alter table public.pedido_items
  drop constraint if exists pedido_items_montos_no_negativos,
  add constraint pedido_items_montos_no_negativos check (precio_unitario >= 0 and subtotal >= 0) not valid;

alter table public.pagos
  drop constraint if exists pagos_monto_no_negativo,
  add constraint pagos_monto_no_negativo check (monto >= 0) not valid;

alter table public.repartidores
  drop constraint if exists repartidores_tarifas_no_negativas,
  add constraint repartidores_tarifas_no_negativas check (coalesce(tarifa_base, 0) >= 0 and coalesce(tarifa_por_km, 0) >= 0) not valid;

alter table public.emprendimientos
  drop constraint if exists emprendimientos_comision_rango,
  add constraint emprendimientos_comision_rango check (comision_repartidor is null or comision_repartidor between 0 and 100) not valid,
  drop constraint if exists emprendimientos_coordenadas_rango,
  add constraint emprendimientos_coordenadas_rango check (
    (latitud is null or latitud between -90 and 90) and (longitud is null or longitud between -180 and 180)
  ) not valid;

-- Un pago del proveedor no puede aplicarse a dos pedidos.
create unique index if not exists pagos_transaccion_id_unica
  on public.pagos (transaccion_id) where transaccion_id is not null;

-- FK sin índice (aviso «unindexed_foreign_keys»).
create index if not exists contactos_producto_id_idx on public.contactos (producto_id);
create index if not exists liquidaciones_pagado_por_idx on public.liquidaciones (pagado_por);
