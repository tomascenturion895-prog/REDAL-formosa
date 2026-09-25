# Arquitectura

## Capas

```
src/
├── app/                 Rutas (Next.js App Router). Componen; no contienen lógica de datos.
│   ├── (sitio)/         Compradores: catálogo, carrito, pedidos, favoritos, admin
│   ├── (productor)/     Panel del emprendedor y del repartidor
│   ├── (auth)/          Ingreso, registro, recuperación de contraseña
│   └── api/             Handlers finos: parsean, delegan a src/server y responden
├── components/          UI. `ui/` son piezas genéricas (Alert, Field, EmptyState, iconos...)
├── lib/
│   ├── domain/          Reglas puras, sin I/O ni React (estados de pedido, precios, CBU, geo)
│   ├── <feature>/       Repositorios: único lugar que habla con Supabase desde el cliente
│   ├── hooks/           useAsync (carga con cancelación)
│   └── supabase/        Clientes (navegador / servidor / service role) y tipos generados
└── server/              Solo servidor: pagos, notificaciones, eventos, composición
```

Regla de dependencias: `app → components → lib/* → lib/domain`. Nada en `lib/domain` importa
React, Supabase ni Next. `server/` nunca se importa desde componentes de cliente.

## Patrones de diseño y por qué

| Patrón | Dónde | Problema que resuelve |
| --- | --- | --- |
| **Repository** | `lib/*/*-repository.ts` | Las páginas no conocen tablas ni RPC. Cada repositorio recibe el cliente por constructor (`Db`), así que se puede probar con uno falso. Lanzan `RepositoryError`: antes devolvían `[]` ante un fallo y ocultaron migraciones sin aplicar. |
| **Adapter + Port** | `server/payments/` | `PaymentGateway` es el puerto; `MercadoPagoGateway` es el adaptador. El resto del servidor no depende de MercadoPago. |
| **Strategy** | `server/notifications/` | `NotificationChannel` (email, SMS). Sumar WhatsApp es escribir un canal, sin tocar `OrderNotifier`. También `RecommendationsRepository` (una función por tipo) y los comparadores de orden del catálogo. |
| **Observer** | `server/events/` | Cuando un pedido se paga se emite `paid`; el notificador está suscripto. Pagos no sabe que existen los emails. |
| **Reducer** | `lib/cart/cart-reducer.ts` | La lógica del carrito es una función pura y testeable. |
| **External store** | `lib/cart/cart-store.ts` | `useSyncExternalStore` sobre localStorage: sin efecto de hidratación y sincronizado entre pestañas. |
| **Composition root** | `server/container.ts` | Único lugar que conoce las implementaciones concretas y las conecta (creación perezosa). |
| **Mapper** | `orders-repository.ts` | Las vistas SQL devuelven todo nullable; se normaliza una sola vez al salir del repositorio. |

## Principios SOLID aplicados

- **S**: las rutas API solo traducen HTTP; `PaymentProcessor` procesa pagos; `OrderNotifier` notifica;
  los componentes renderizan y los repositorios acceden a datos.
- **O**: nuevos canales, tipos de recomendación o criterios de orden se agregan sin modificar lo existente.
- **L**: cualquier `NotificationChannel` o `PaymentGateway` es intercambiable (los tests usan falsos).
- **I**: interfaces mínimas (`PaymentGateway` son tres métodos; `NotificationChannel`, tres).
- **D**: `PaymentProcessor`, `CheckoutService` y `OrderNotifier` reciben sus dependencias; solo
  `container.ts` construye las concretas.

## Modelo de seguridad

La autorización real vive en la base (RLS + funciones `security definer`). La interfaz solo oculta
lo que no corresponde.

- **Pedidos**: se crean únicamente con `crear_pedido()`, que lee precios de la tabla y calcula el
  envío. El comprador no puede cambiar el monto ni marcarse como pagado (trigger
  `protect_pedido_columns`); solo el webhook, con service role, pasa un pedido a `pagado`.
- **Pagos**: `CheckoutService` arma el cobro leyendo el pedido de la base. El webhook consulta el
  pago directo a MercadoPago, verifica la firma si hay `MERCADOPAGO_WEBHOOK_SECRET`, compara el monto
  y hace la transición `pendiente_pago → pagado` de forma atómica (idempotente ante reintentos).
- **Admin**: `profiles.role = 'admin'`. Todas las operaciones administrativas son funciones que
  verifican `is_admin()`. Un usuario no puede modificar su propio `role`.
- **Privacidad**: `profiles` (teléfono, cuenta bancaria) y `repartidores` solo son legibles por su
  titular y admins. Los documentos de identidad están en un bucket privado. La cuenta bancaria además
  está cifrada (ver "Datos sensibles y abuso").
- **Recursión de políticas**: `pedidos` y `repartidores` se consultan mutuamente; los helpers
  `owns_repartidor()` e `is_buyer_of_repartidor()` (security definer) cortan el ciclo.

## Convenciones

- Los tipos de la base son **generados** (`database.types.ts`); no se escriben a mano ni se usa `any`
  para esquivarlos.
- Un componente que carga datos usa `useAsync`; no repite `useEffect` + `loading` + `error`.
- Páginas que exigen sesión usan `useRequireAuth` (redirige dentro de un efecto).
- Mensajes de error al usuario: en español, sin detalles internos; el detalle va a `console.error`.
- Colores y formas salen de los tokens de `globals.css` (`bg-surface`, `text-muted`, `btn-primary`,
  `field`, `card`, `price-tag`); no se escriben valores hex en componentes.

## Sistema de diseño

Identidad: **crema** (fondo), **monte** verde bosque (texto y modo oscuro), **chacra** verde (acción), **sol** ámbar
(destacado) y **río** celeste (información). Tipografía: Fraunces (serif con carácter, títulos) + Figtree (interfaz).
Tema claro/oscuro: `data-theme` en `<html>` (botón en el encabezado, guardado en `localStorage`; sin elección
sigue al sistema). Los estados vacíos usan ilustraciones (`ui/illustrations.tsx`) según el caso: canasta, mapa, búsqueda, error. Se define en tres capas en `globals.css`: escalas crudas
(`primary`, `accent`, `sky`, `ink`, `neutral`), tokens semánticos (`--background`, `--action`, `--muted`…) que
cambian en modo oscuro, y utilidades de Tailwind expuestas desde esos semánticos. Para cambiar la marca
alcanza con tocar las escalas o los semánticos; los componentes no se modifican.

- Contraste: el verde 500 (`#17924E`) es solo para rellenos; el texto blanco sobre verde y los enlaces usan
  el 700 (`#0E7A3F`, 5.2:1). Los bordes de controles usan `--border-strong` (≥3:1).
- Elemento distintivo: la etiqueta de precio (`price-tag`) y el mapa de emprendimientos.
- El mapa (`components/map`) dibuja solo emprendimientos con ubicación válida (`lib/domain/map.ts`). Los pines
  se estilizan con tokens y **nunca** se arma HTML con texto de personas: el detalle es una tarjeta de React.
  Leaflet se carga diferido (`lazy-map.tsx`) y el contenedor usa `isolate` para no tapar el encabezado fijo.
- Imágenes de producto con `ProductImage` (`next/image`): se sirven redimensionadas y en WebP/AVIF.

## Pruebas

`npm test` corre Vitest sobre la lógica que no depende de la interfaz: reducer del carrito, precios,
CBU, redirecciones seguras, plantillas (escape de HTML), bus de eventos, firma del webhook, cifrado
AES-GCM, limitador de frecuencia, servicio de cuenta bancaria y el procesador de pagos con una base en memoria.

Las migraciones se validan aparte contra un Postgres con PostGIS: 14 migraciones en orden y 24 escenarios de
seguridad (escalada de rol, auto-pago, lectura de perfiles ajenos, escritura de la cuenta bancaria, etc.).

## Variables de entorno

Ver `.env.example`. Las `NEXT_PUBLIC_*` se incrustan al compilar (por eso el `Dockerfile` las recibe
como `ARG`); el resto se lee en tiempo de ejecución y nunca llega al navegador.

## Datos sensibles y abuso

- **Cuenta bancaria**: se cifra en el servidor con AES-256-GCM (`server/security/secret-cipher.ts`) antes de
  guardarse. El formato `<idClave>:<iv>:<tag>:<cifrado>` permite rotar claves (`BANK_ENCRYPTION_KEYRING`).
  El navegador no escribe la columna: un trigger de `profiles` lo impide y solo el service role (la ruta
  `/api/producer/bank-account`) puede hacerlo. La clave vive en el entorno, separada de la base.
- **Limitación de frecuencia**: `RateLimiter` es un puerto; `InMemoryRateLimiter` (ventana fija) protege
  el checkout, el guardado bancario y el webhook. Es por instancia: con varias réplicas conviene una
  implementación sobre Redis, sin tocar las rutas. Las llamadas que van directo del navegador a Supabase
  (RPC, tablas) dependen de los límites del propio Supabase.
- **Ubicación de entrega**: el comprador puede compartirla al pagar; se guarda en `pedidos.entrega_lat/lng`
  (inmutable para él después, ver `protect_pedido_columns`) y alimenta el mapa. Sin ella, el mapa muestra el
  centro de Formosa como referencia.

## Pendiente

- El límite de frecuencia en memoria no es global entre réplicas (ver arriba).
- Falta una pantalla para que el productor vea o cambie su cuenta bancaria ya guardada (hoy solo se carga).
