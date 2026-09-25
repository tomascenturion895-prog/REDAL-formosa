# RedAL Formosa — Documentación técnica

> **Versión del documento:** basada en el estado del repositorio a septiembre de 2026 (`package.json` v0.1.0).
> Los datos que no pudieron determinarse desde el código figuran como **[PENDIENTE: …]**.

## Tabla de contenidos

1. [Introducción y propósito](#1-introducción-y-propósito)
2. [Arquitectura y tecnologías](#2-arquitectura-y-tecnologías)
3. [Requisitos del sistema](#3-requisitos-del-sistema)
4. [Guía de instalación y configuración](#4-guía-de-instalación-y-configuración)
5. [Estructura del proyecto](#5-estructura-del-proyecto)
6. [Ejemplos de uso y API](#6-ejemplos-de-uso-y-api)
7. [Pruebas, calidad y operación](#7-pruebas-calidad-y-operación)
8. [Puntos pendientes y limitaciones conocidas](#8-puntos-pendientes-y-limitaciones-conocidas)

---

## 1. Introducción y propósito

**RedAL Formosa** ("Red de Abastecimiento Local") es un marketplace web que conecta a **emprendedores y
productores de la provincia de Formosa (Argentina)** con **compradores locales**, sin intermediarios. Las
personas pueden explorar productos y emprendimientos, verlos en un mapa, contactar al vendedor, comprar con
MercadoPago y seguir la entrega.

### Problema que resuelve

Los productores locales carecen de un canal digital propio, económico y visible para vender. RedAL les ofrece:

- Un **catálogo público** con búsqueda de texto completo en español, favoritos, calificaciones y recomendaciones.
- **Visibilidad geográfica**: un mapa con los emprendimientos que cargaron su ubicación.
- **Cobro integrado** con MercadoPago y **notificaciones** por email y SMS.
- **Herramientas de gestión** para el vendedor: alta de productos (incluida por voz con IA), ubicación, datos
  bancarios cifrados y validación de identidad.
- **Moderación** por parte de administradores (alta de productos, roles y auditoría).

### Roles de usuario

| Rol efectivo | Cómo se determina | Capacidades principales |
| --- | --- | --- |
| `COMPRADOR` | Rol por defecto (`profiles.role = 'comprador'`) | Explorar, comprar, favoritos, calificar, ver pedidos y su seguimiento. |
| `VENDEDOR` | `profiles.role = 'emprendedor'` **o** ser dueño de al menos un emprendimiento | Lo anterior, más panel del productor, alta de productos, ubicación, datos bancarios, "Voz a Catálogo". |
| `ADMIN` | `profiles.role = 'admin'` | Panel `/admin`: usuarios y roles, aprobación de productos, estadísticas y auditoría. Conserva las herramientas de vendedor. |

El rol `repartidor` **no** es un rol de usuario: es un registro en la tabla `repartidores` ligado a una cuenta.
La lógica del rol efectivo vive en `src/server/auth/roles.ts`.

---

## 2. Arquitectura y tecnologías

### 2.1 Vista general

```
Navegador (React 19, PWA)
   │  ├── consultas directas a Supabase (Auth, PostgREST, Realtime, Storage) protegidas por RLS
   │  └── llamadas a rutas /api/* (operaciones que requieren secretos o lógica de servidor)
   ▼
Next.js 16 (App Router, salida "standalone")
   ├── proxy.ts  → refresca la sesión de Supabase en cada request
   ├── app/api/*  → handlers finos (parsean, delegan, responden)
   └── server/*   → servicios: pagos, notificaciones, IA, geocodificación, cifrado, límites de uso
   ▼
Supabase (PostgreSQL + PostGIS)  ·  MercadoPago  ·  OpenAI  ·  Nominatim  ·  SendGrid  ·  Twilio
```

**Principio rector:** la autorización real vive en la base de datos (RLS, funciones `security definer` y
triggers). La interfaz solo oculta lo que no corresponde; las rutas de servidor añaden validaciones y límites.

### 2.2 Stack tecnológico

| Capa | Tecnología | Justificación |
| --- | --- | --- |
| Framework | **Next.js 16.3** (App Router, Turbopack, `output: "standalone"`) | Renderizado híbrido, rutas API integradas y una imagen Docker mínima. |
| UI | **React 19.2**, **Tailwind CSS 4** | Sistema de diseño con tokens semánticos en `globals.css` (tema claro/oscuro sin tocar componentes). |
| Tipografía | Fraunces (títulos) + Figtree (interfaz), vía `next/font` | Se sirven desde el propio dominio, sin dependencias externas en tiempo de ejecución. |
| Mapas | **Leaflet** + teselas de OpenStreetMap | Sin claves ni costos; carga diferida (`dynamic`, sin SSR). |
| Imágenes | `next/image` + **sharp** | Redimensionado y formatos WebP/AVIF. |
| Datos y auth | **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL gestionado con Auth (email y OAuth), Storage, Realtime y RLS. |
| Base de datos | **PostgreSQL 17** con **PostGIS** | Modelo relacional, búsqueda de texto completo (`search_productos`) y tipos geográficos. |
| Pagos | **MercadoPago** (Checkout Pro, webhook) | Medio de pago habitual en Argentina. |
| IA | **OpenAI**: Whisper (transcripción) y `gpt-4o-mini` (salida estructurada) | Herramienta "Voz a Catálogo" para vendedores. |
| Geocodificación | **Nominatim** (OpenStreetMap) | Convierte direcciones en coordenadas sin clave de API. |
| Notificaciones | **SendGrid** (email) y **Twilio** (SMS) | Canales intercambiables detrás de una interfaz común. |
| Pruebas | **Vitest** (unitarias) y **Playwright** (E2E) | Lógica pura testeada sin UI; recorridos críticos en navegador. |
| Contenedores | **Docker** / Docker Compose | Entorno reproducible; las variables `NEXT_PUBLIC_*` se incrustan al compilar. |

### 2.3 Capas del código y regla de dependencias

```
app → components → lib/* → lib/domain
```

- `lib/domain`: reglas puras (estados de pedido, precios, CBU, geografía, WhatsApp, borrador de voz). Sin React,
  Supabase ni Next.
- `lib/<feature>`: **repositorios**, el único lugar que habla con Supabase desde el navegador.
- `server/`: código exclusivo de servidor; nunca se importa desde componentes de cliente.

### 2.4 Patrones de diseño aplicados

| Patrón | Dónde | Propósito |
| --- | --- | --- |
| Repository | `lib/*/*-repository.ts` | Las páginas no conocen tablas ni RPC; el cliente se inyecta (`Db`), lo que permite pruebas. |
| Adapter + Port | `server/payments`, `server/ai`, `server/geo` | `PaymentGateway`, `SpeechToText`, `ProductExtractor` y `Geocoder` aíslan a cada proveedor externo. |
| Strategy | `server/notifications` | `NotificationChannel` (email, SMS); un canal nuevo no modifica al notificador. |
| Observer | `server/events` | Al pagarse un pedido se emite `paid`; el notificador está suscripto sin que Pagos lo conozca. |
| Reducer + Store externo | `lib/cart` | Carrito como función pura y `useSyncExternalStore` sobre `localStorage`, con un carrito por cuenta. |
| Composition root | `server/container.ts` | Único lugar que conoce las implementaciones concretas (creación perezosa). |
| Mapper | `orders-repository.ts` | Normaliza las vistas SQL, que devuelven todo nullable. |

### 2.5 Modelo de seguridad

- **Pedidos:** se crean únicamente con la función `crear_pedido()`, que lee los precios de la base y calcula el
  envío. El comprador no puede modificar el monto ni marcarse como pagado (trigger `protect_pedido_columns`).
- **Pagos:** el webhook consulta el pago directamente a MercadoPago, verifica la firma si hay
  `MERCADOPAGO_WEBHOOK_SECRET`, compara el monto y hace la transición `pendiente_pago → pagado` de forma
  atómica e idempotente.
- **Privacidad:** `profiles` y `repartidores` solo son legibles por su titular y administradores; los documentos
  de identidad están en un bucket privado.
- **Datos bancarios:** se cifran en el servidor con **AES-256-GCM** (soporta rotación con `BANK_ENCRYPTION_KEYRING`);
  un trigger impide que el navegador escriba la columna, y solo la ruta de servidor (service role) puede hacerlo.
- **Roles:** nadie puede cambiar su propio rol (trigger `protect_profile_privileged_columns`); las operaciones
  administrativas son funciones que verifican `is_admin()` y quedan auditadas.
- **Abuso:** limitador de frecuencia por usuario o IP en checkout, datos bancarios, voz, geocodificación y webhook.
- **Cabeceras:** `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y
  `Cache-Control: private, no-store` en `/api/*`.
- **Estado por cuenta:** las cargas de datos y el carrito se separan por usuario, para que nada se filtre entre sesiones
  en el mismo navegador.

### 2.6 Modelo de datos

Tablas del esquema `public`: `profiles`, `emprendimientos`, `categorias`, `productos`, `pedidos`, `pedido_items`,
`pagos`, `wishlist`, `calificaciones`, `resenas`, `contactos`, `notificaciones`, `preferencias_notificaciones`,
`repartidores`, `intentos_entrega`, `ubicaciones_tiempo_real`, `validacion_biometrica` y `admin_audit_log`
(más `spatial_ref_sys` de PostGIS).

**Estados de un pedido:** `pendiente_pago` → `pagado` → `en_preparacion` → `listo` → `en_camino` → `entregado`
(o `cancelado`).

**Funciones RPC usadas por la aplicación:** `crear_pedido`, `productor_pedidos`, `productor_avanzar_pedido`, `admin_resumen`, `admin_pending_verifications`, `admin_review_verification`, `search_productos`, `productos_mas_vendidos`,
`recomendaciones_usuario`, `admin_get_stats`, `admin_list_users`, `admin_pending_products`, `admin_review_product`
y `admin_set_role`.

**Storage:** buckets `product-images` (público) y `biometric-verification` (privado).

---

## 3. Requisitos del sistema

### 3.1 Requisitos funcionales

| ID | Requisito |
| --- | --- |
| RF-01 | Registro e inicio de sesión con email y contraseña, recuperación de contraseña y acceso con Google, Facebook y X (según proveedores habilitados). |
| RF-02 | Catálogo de productos con búsqueda de texto completo, filtros de precio y disponibilidad, y orden. |
| RF-03 | Listado y ficha de emprendimientos; mapa interactivo con búsqueda por nombre o zona. |
| RF-04 | Contacto directo con el vendedor mediante un botón de WhatsApp con mensaje pre-cargado. |
| RF-05 | Carrito por cuenta (un solo emprendimiento por pedido) y checkout con MercadoPago. |
| RF-06 | Confirmación y estado del pedido, historial, seguimiento de entrega con mapa en tiempo real. |
| RF-07 | Favoritos, calificaciones de 1 a 5 estrellas y recomendaciones personalizadas y por ventas. |
| RF-08 | Panel del vendedor: alta de emprendimiento, ubicación (por dirección o por posición actual), horarios, productos, fotos. |
| RF-09 | "Voz a Catálogo": dictado de un producto que pre-llena el formulario mediante IA. |
| RF-10 | Datos bancarios del vendedor (CBU validado) y verificación de identidad con documentos. |
| RF-11 | Moderación: aprobación de productos, gestión de usuarios y roles, estadísticas y auditoría. |
| RF-12 | Notificaciones por email y SMS según las preferencias de cada persona. |
| RF-13 | Modo claro y oscuro con preferencia guardada; aplicación instalable (PWA). |

### 3.2 Requisitos no funcionales

| ID | Requisito |
| --- | --- |
| RNF-01 | **Seguridad:** autorización en la base (RLS), secretos solo en servidor, datos bancarios cifrados, límites de uso. |
| RNF-02 | **Responsive:** interfaz fluida desde 320 px de ancho, sin desborde horizontal. |
| RNF-03 | **Accesibilidad:** contraste AA, foco visible, etiquetas en formularios, respeto de `prefers-reduced-motion`. |
| RNF-04 | **Rendimiento:** imágenes optimizadas, mapa con carga diferida, esqueletos de carga en rutas pesadas. |
| RNF-05 | **Privacidad:** el service worker nunca cachea páginas ni datos de la persona con sesión. |
| RNF-06 | **Mantenibilidad:** capas con dependencias en un solo sentido, tipos de base de datos generados, reglas de negocio puras y testeadas. |
| RNF-07 | **Idioma:** interfaz en español rioplatense (voseo). |
| RNF-08 | **Disponibilidad y escalado:** el limitador de frecuencia es por instancia; con varias réplicas requiere un almacén compartido (ver sección 8). |

### 3.3 Requisitos de entorno

| Componente | Requisito |
| --- | --- |
| Node.js | **20 o superior** (la imagen Docker usa `node:20-alpine`; el cliente de Supabase avisa que Node 20 dejará de soportarse, por lo que se recomienda planificar el paso a 22). |
| npm | Incluido con Node (el proyecto usa `package-lock.json`). |
| Docker (opcional) | Docker Desktop o Engine con Compose v2. |
| Cuenta de Supabase | Un proyecto propio (URL, clave pública y, para funciones de servidor, la clave de servicio). |
| Supabase CLI (opcional) | `npx supabase` para aplicar migraciones y generar tipos. |
| Servicios externos | MercadoPago, SendGrid, Twilio y OpenAI son **opcionales** para levantar el proyecto: cada funcionalidad asociada queda deshabilitada con un aviso si falta su clave. |

---

## 4. Guía de instalación y configuración

### 4.1 Obtener el código

```bash
git clone https://github.com/tomascenturion895-prog/REDAL-formosa.git
cd REDAL-formosa/redal-formosa      # la aplicación está en la subcarpeta redal-formosa
```

### 4.2 Variables de entorno

Copiar la plantilla y completarla (el archivo `.env` está ignorado por git):

```bash
cp .env.example .env
```

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto de Supabase (Project Settings → API). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave pública (`sb_publishable_…`). La app **no** usa `ANON_KEY`. |
| `NEXT_PUBLIC_APP_URL` | Sí | URL pública de la app (`http://localhost:3000` en local). MercadoPago la usa para el retorno y el webhook. |
| `SUPABASE_SERVICE_ROLE_KEY` | Para pagos, datos bancarios y `make-admin` | Clave de servicio. **Solo servidor**; nunca con prefijo `NEXT_PUBLIC_`. |
| `BANK_ENCRYPTION_KEY` | Para guardar datos bancarios | Clave AES-256 en base64. Generar con `openssl rand -base64 32` y **conservar una copia aparte**: sin ella no se pueden descifrar los datos. |
| `BANK_ENCRYPTION_KEYRING` | Opcional | JSON `{"currentId":"v2","keys":{"v1":"…","v2":"…"}}` para rotar claves; reemplaza a la anterior. |
| `MERCADOPAGO_ACCESS_TOKEN` | Para cobrar | Credencial de prueba (`TEST-…`) o de producción. |
| `MERCADOPAGO_WEBHOOK_SECRET` | Opcional | Si se define, se valida la firma de cada notificación. |
| `SENDGRID_API_KEY`, `NOTIFICATIONS_FROM_EMAIL` | Para emails | Remitente verificado en SendGrid. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Para SMS | Credenciales de Twilio. |
| `OPENAI_API_KEY` | Para "Voz a Catálogo" | Solo servidor. |

Las variables `NEXT_PUBLIC_*` se **incrustan al compilar**; si se modifican, hay que reconstruir.

### 4.3 Base de datos (Supabase)

Las migraciones están en `supabase/migrations/` (00 a 15). Para un proyecto nuevo o existente hay dos caminos:

**Opción A — SQL Editor.** Pegar y ejecutar una sola vez `supabase/pending-migrations.sql` (migraciones 02 a 15).
Las migraciones 00 y 01 deben estar aplicadas antes.

**Opción B — CLI de Supabase.**

```bash
npx supabase login
npx supabase link --project-ref <ref-del-proyecto>
npx supabase db push
```

Verificación: en el panel de Storage deben existir los buckets `product-images` y `biometric-verification`.

Tras cambiar el esquema, regenerar los tipos:

```bash
npx supabase gen types typescript --project-id <ref> --schema public > src/lib/supabase/database.types.ts
```

### 4.4 Ejecución local (sin Docker)

```bash
npm install
npm run dev          # http://localhost:3000
```

### 4.5 Ejecución con Docker

```bash
docker compose up -d --build     # http://localhost:3000
```

```bash
docker compose logs -f app       # ver registros
docker compose down              # detener y quitar el contenedor
```

Detalles en [`DOCKER_SETUP.md`](../DOCKER_SETUP.md). Para desarrollo con recarga en caliente, usar `npm run dev`.

### 4.6 Autenticación con proveedores sociales (opcional)

En el panel de Supabase (Authentication → Providers) habilitar Google, Facebook o X con las credenciales de cada
consola de desarrollador. La URL de callback de Supabase debe registrarse en cada proveedor, y las URL de la app
(`http://localhost:3000/**`, más el dominio de producción) en Authentication → URL Configuration → Redirect URLs.
La aplicación completa el intercambio en `/auth/callback`.

### 4.7 Crear una cuenta administradora (solo pruebas)

Con `SUPABASE_SERVICE_ROLE_KEY` en el `.env`:

```bash
npm run make-admin -- correo@ejemplo.com [contraseña]
```

Crea la cuenta (confirmada) o promueve una existente. Alternativa manual: `supabase/dev-make-admin.sql`.

### 4.8 Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (webpack). |
| `npm run build` / `npm start` | Compilación y ejecución de producción. |
| `npm test` | Pruebas unitarias (Vitest). |
| `npm run typecheck` | Verificación de tipos con TypeScript. |
| `npm run lint` | ESLint. |
| `npx playwright test` | Pruebas E2E (requieren la app en `http://localhost:3000`). |
| `npm run make-admin -- <email>` | Crear o promover un administrador (solo pruebas). |
| `npm run seed` | Simulacro de los datos de prueba (5 productores, 2 clientes, 6 categorías, 26 productos). Con `-- --apply` los crea; con `-- --apply --remove` los borra. |

---

## 5. Estructura del proyecto

```
redal-formosa/
├── src/
│   ├── app/                      Rutas (App Router)
│   │   ├── (sitio)/              Compradores: portada, catálogo, mapa, carrito, checkout, pedidos, favoritos, admin
│   │   ├── (productor)/          Panel del vendedor: dashboard, setup, tracking del repartidor
│   │   ├── (auth)/               Ingreso, registro y recuperación de contraseña
│   │   ├── api/                  Rutas de servidor (ver sección 6)
│   │   ├── auth/callback/        Intercambio del código OAuth por sesión
│   │   ├── b2b/, productor/      Vistas B2B y de productor (contenido de muestra: ver sección 8)
│   │   ├── error.tsx, not-found.tsx, global-error.tsx
│   │   └── globals.css           Tokens de diseño y utilidades (btn, card, field, chip…)
│   ├── components/               UI por dominio (ui/, layout/, catalog/, map/, checkout/, productor/, contact/…)
│   ├── lib/
│   │   ├── domain/               Reglas puras (pedidos, precios, CBU, geografía, WhatsApp, voz)
│   │   ├── <feature>/            Repositorios: catalog, orders, wishlist, ratings, producer, admin, recommendations…
│   │   ├── auth/                 Contexto de sesión, acciones, estado por cuenta
│   │   ├── cart/                 Reducer y almacén del carrito
│   │   ├── supabase/             Clientes (navegador, servidor, admin), sesión y tipos generados
│   │   └── hooks/                useAsync (carga con cancelación y aislamiento por cuenta)
│   ├── server/                   Solo servidor
│   │   ├── payments/             Pasarela MercadoPago, checkout y procesador del webhook
│   │   ├── ai/                   Whisper, extracción con GPT y servicio "Voz a Catálogo"
│   │   ├── geo/                  Geocodificación (Nominatim)
│   │   ├── notifications/        Canales de email y SMS, plantillas y notificador de pedidos
│   │   ├── security/             Cifrado AES-GCM y limitador de frecuencia
│   │   ├── producer/             Servicio de datos bancarios
│   │   ├── auth/roles.ts         Rol efectivo y `requireRole`
│   │   └── container.ts          Raíz de composición
│   └── proxy.ts                  Refresco de sesión de Supabase en cada request
├── supabase/
│   ├── migrations/               Migraciones 00 a 15
│   ├── pending-migrations.sql    Migraciones 02 a 15 en un solo archivo
│   └── dev-make-admin.sql        Script de pruebas para crear un admin
├── tests/                        Pruebas E2E (Playwright)
├── scripts/make-admin.mjs        Utilidad de pruebas
├── docs/                         ARCHITECTURE.md y este documento
├── public/                       Íconos, manifest de la PWA y service worker
├── Dockerfile, docker-compose.yml
└── .env.example
```

---

## 6. Ejemplos de uso y API

Las rutas de `/api/*` responden siempre JSON y con `Cache-Control: private, no-store`. Los errores esperables
llegan como `{ "error": "<mensaje en español>" }` con el código HTTP correspondiente (`400`, `401`, `403`, `404`,
`409`, `429` con `Retry-After`, `503`); cualquier otro fallo devuelve `500` sin detalles internos.

### 6.1 Resumen

| Método y ruta | Autenticación | Límite de uso | Descripción |
| --- | --- | --- | --- |
| `POST /api/checkout/create-preference` | Sesión | 10 / min por usuario | Crea la preferencia de pago de un pedido. |
| `POST /api/webhooks/mercadopago` | Firma opcional | 300 / min por IP | Recibe notificaciones de pago. |
| `POST /api/producer/bank-account` | Sesión | 5 / min por usuario | Guarda la cuenta bancaria cifrada. |
| `POST /api/producer/voice-to-product` | Sesión + rol VENDEDOR o ADMIN | 10 / min por usuario | Audio → borrador de producto. |
| `GET /api/geocode?q=` | Sesión | 15 / min por usuario, 50 / min global | Dirección → coordenadas. |
| `POST /api/buyer/recipes` | Sesión | 6 / min por usuario | Inventario de un emprendimiento → 2 recetas con sus ingredientes. |
| `GET /auth/callback` | — | — | Cierre del flujo OAuth. |

### 6.2 `POST /api/checkout/create-preference`

El pedido se crea antes desde el navegador con la función `crear_pedido()`; esta ruta solo genera el cobro.

```bash
curl -X POST http://localhost:3000/api/checkout/create-preference \
  -H "Content-Type: application/json" \
  -H "Cookie: <cookies de sesión de Supabase>" \
  -d '{"pedidoId":"<uuid-del-pedido>"}'
```

```json
{ "url": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..." }
```

### 6.3 `POST /api/webhooks/mercadopago`

Cuerpo de MercadoPago (`type`, `data.id`) y cabeceras `x-signature` y `x-request-id`.

```json
{ "status": "processed", "orderId": "<uuid>", "paid": true }
```

Los eventos que no son de tipo `payment` responden `{ "status": "ignored" }`. El procesamiento es idempotente ante reintentos.

### 6.4 `POST /api/producer/bank-account`

```bash
curl -X POST http://localhost:3000/api/producer/bank-account \
  -H "Content-Type: application/json" -H "Cookie: <sesión>" \
  -d '{"cbu":"0110599500000123456784","banco":"<código de banco>","titular":"Nombre Apellido"}'
```

El CBU se valida con los dos dígitos verificadores del BCRA. **[PENDIENTE: Documentar el listado de códigos de banco admitidos (`lib/domain/banks.ts`)]**.

```json
{ "ok": true }
```

### 6.5 `POST /api/producer/voice-to-product`

Formulario `multipart/form-data` con el campo `audio` (formatos webm, ogg, mp4, mp3, wav o m4a; entre 1 KB y 5 MB).

```bash
curl -X POST http://localhost:3000/api/producer/voice-to-product \
  -H "Cookie: <sesión>" -F "audio=@dictado.webm;type=audio/webm"
```

```json
{
  "transcript": "Tengo 10 kilos de zapallo a 1000 pesos",
  "draft": { "producto": "Zapallo", "cantidad": 10, "precio": 1000, "unidad": "kg" }
}
```

`unidad` es una de `unidad`, `kg`, `litro`, `metro` o `pack`. La cantidad no se guarda como stock: se agrega a la descripción.

### 6.6 `GET /api/geocode`

```bash
curl "http://localhost:3000/api/geocode?q=Santiago%20del%20Estero%20480" -H "Cookie: <sesión>"
```

```json
{ "results": [ { "lat": -26.189, "lng": -58.226, "label": "Santiago del Estero, Formosa, …" } ] }
```

Devuelve hasta 4 resultados, restringidos a la provincia de Formosa.

### 6.7 Funciones de base de datos (RPC)

Se invocan desde el cliente con `supabase.rpc(...)` y verifican permisos en la propia base:

```ts
// Crear un pedido (los precios y el envío los calcula la base)
await supabase.rpc("crear_pedido", { /* ítems, datos de entrega, coordenadas */ });

// Búsqueda de texto completo
await supabase.rpc("search_productos", { search_query: "miel", price_max: 5000, disponible_only: true });
```

**[PENDIENTE: Documentar la firma completa de `crear_pedido` (parámetros `p_*`) a partir de `database.types.ts`]**.

### 6.8 Flujos de uso principales

- **Comprador:** explora `/productos` o `/mapa` → agrega al carrito → `/checkout` (opcionalmente comparte su ubicación de entrega) → paga en MercadoPago → `/confirmacion` → sigue el pedido en `/mis-pedidos` y `/tracking/[pedidoId]`.
- **Vendedor:** se registra → `/setup` (emprendimiento, ubicación, verificación) → `/dashboard` (productos, con "Voz a Catálogo") → un administrador aprueba los productos nuevos antes de que se publiquen.
- **Administrador:** `/admin` (estadísticas), `/admin/productos` (moderación) y `/admin/usuarios` (roles).

---

## 7. Pruebas, calidad y operación

- **Unitarias (Vitest):** `npm test`. Cubren carrito, precios, CBU, mapa, WhatsApp, voz, plantillas de notificación
  (escape de HTML), bus de eventos, firma del webhook, cifrado AES-GCM, limitador de frecuencia, servicio bancario,
  geocodificación y el procesador de pagos con una base en memoria.
- **E2E (Playwright):** `tests/*.spec.ts` (autenticación, catálogo, carrito, checkout, mapa, navegación, rutas protegidas y B2B).
  Requieren la aplicación en ejecución en `http://localhost:3000`.
- **Migraciones:** validadas contra un PostgreSQL con PostGIS (todas las migraciones en orden y escenarios de
  seguridad: escalada de rol, auto-pago, lectura de perfiles ajenos, escritura de datos bancarios, etc.).
- **Calidad estática:** `npm run typecheck` y `npm run lint`.
- **Despliegue:** la imagen Docker usa una compilación multietapa (`deps` → `builder` → `runner`) con salida
  `standalone` y un usuario sin privilegios. **[PENDIENTE: Especificar entorno y URL de producción, y proceso de despliegue continuo]**.

---

## 8. Puntos pendientes y limitaciones conocidas

- **Limitador de frecuencia por instancia:** con varias réplicas, cada una cuenta por separado. Para un límite global
  hace falta una implementación de `RateLimiter` sobre un almacén compartido (por ejemplo, Redis), sin tocar las rutas.
- **Cuenta bancaria:** no existe aún una pantalla para ver o cambiar una cuenta ya guardada (hoy solo se carga).
- **Stock:** el esquema no tiene inventario; la cantidad dictada por voz se guarda como nota en la descripción.
- **Vistas de muestra:** `/b2b` y `/productor/[id]` (aportadas por otro flujo de trabajo) usan listas vacías o contenido
  fijo; **[PENDIENTE: Definir la fuente de datos real y el alcance del canal B2B]**.
- **Código sin uso:** `components/layout/Navbar.tsx` y `Footer.tsx` no se utilizan (el sitio usa `site-header` y `site-footer`).
- **Historial de migraciones remoto:** las migraciones se aplicaron manualmente; el historial de Supabase CLI
  está vacío, por lo que `supabase db push` intentaría reaplicarlas. **[PENDIENTE: Reconciliar el historial (`supabase migration repair`) antes de usar `db push`]**.
- **Ajustes en el panel de Supabase:** habilitar los proveedores OAuth deseados, decidir si se exige confirmación de
  email y configurar un SMTP propio (el correo integrado tiene un límite muy bajo por hora).
- **Producción de MercadoPago y Meta:** las credenciales de producción, la política de privacidad y el paso a modo
  "Producción" de las apps de Facebook/Google **[PENDIENTE: Especificar responsables y fechas]**.
- **Licencia y equipo:** **[PENDIENTE: Especificar la licencia del proyecto y los responsables de mantenimiento]**.
- **Privacidad del contacto:** el teléfono del vendedor y el botón de WhatsApp son públicos; se puede exigir sesión
  cambiando `useCanSeeContact()` en `src/lib/contact/visibility.ts`.
