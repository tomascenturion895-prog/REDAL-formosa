# Docker

## Levantar la app

1. Copiá `.env.example` a `.env` y completá los valores (el archivo `.env` está ignorado por git).
2. Ejecutá:

```bash
docker compose up -d --build
```

3. Abrí http://localhost:3000.

## Cosas a tener en cuenta

- Las variables `NEXT_PUBLIC_*` se **incrustan al compilar**, no al ejecutar. Por eso el `Dockerfile`
  las recibe como `ARG` y `docker-compose.yml` se las pasa desde `.env`. Si cambiás una, reconstruí
  la imagen (`--build`).
- Las variables privadas (`SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_*`, `SENDGRID_*`, `TWILIO_*`) se
  leen en tiempo de ejecución desde `.env` y nunca llegan al navegador.
- La app usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (no `ANON_KEY`).

## Comandos útiles

```bash
docker compose logs -f app     # ver logs
docker compose down            # detener y quitar el contenedor
docker compose up -d --build   # reconstruir tras cambiar código o variables NEXT_PUBLIC_*
```

## Base de datos

Las migraciones están en `supabase/migrations/`. Para aplicar las pendientes en un proyecto de
Supabase existente, pegá `supabase/pending-migrations.sql` en el SQL Editor (una sola vez), o vinculá el
proyecto con la CLI (`npx supabase login`, `npx supabase link`, `npx supabase db push`).
