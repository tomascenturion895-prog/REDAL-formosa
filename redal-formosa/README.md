# RedAL Formosa

Marketplace para que emprendedores y productores de Formosa vendan directo a compradores locales.
Next.js 16 (App Router) + Supabase + MercadoPago.

## Empezar

```bash
cp .env.example .env      # completar las variables
npm install
npm run dev               # http://localhost:3000
```

| Comando             | Qué hace                                        |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                          |
| `npm run build`     | Compilación de producción                       |
| `npm test`          | Pruebas unitarias (Vitest)                      |
| `npm run typecheck` | Verificación de tipos                           |
| `npm run lint`      | ESLint                                          |

Con Docker: `docker compose up -d --build` (ver [DOCKER_SETUP.md](DOCKER_SETUP.md)).

## Base de datos

Las migraciones están en `supabase/migrations/`. Para aplicarlas a un proyecto existente, pegá
`supabase/pending-migrations.sql` en el SQL Editor de Supabase, o usá la CLI
(`npx supabase login`, `link`, `db push`).

Después de cambiar el esquema, regenerá los tipos:

```bash
npx supabase gen types typescript --project-id <ref> --schema public > src/lib/supabase/database.types.ts
```

## Documentación

- [docs/DOCUMENTACION_TECNICA.md](docs/DOCUMENTACION_TECNICA.md): documentación técnica completa (arquitectura, instalación, API, pendientes).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): capas, patrones de diseño, modelo de seguridad y convenciones.
