# REDAL Formosa

Marketplace de emprendedores locales de Formosa. La aplicación (Next.js + Supabase) vive en [`redal-formosa/`](./redal-formosa); ahí están el código, las migraciones (`supabase/migrations`) y la documentación (`README.md`, `docs/`).

```bash
cd redal-formosa
npm install
npm run dev
```

Con Docker: `docker compose up --build` desde esta carpeta (usa `redal-formosa/` como contexto).

Si desplegás en Vercel, el **Root Directory** del proyecto debe ser `redal-formosa`.
