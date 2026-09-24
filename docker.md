# REDAL - Paso 1.5: Configuración de Docker y Docker Compose

**Proyecto:** REDAL (Red de Emprendimientos y Desarrollo de Abastecimiento Local)  
**Objetivo:** Crear la configuración de Dockerization optimizada (multi-stage) para Next.js (App Router) y Docker Compose para levantar la aplicación en cualquier entorno en un solo comando.

---

## 1. Modificación previa en `next.config.mjs` / `next.config.js`

Para que Docker pueda empaquetar una imagen liviana de Next.js, se debe habilitar la salida independiente (`standalone`). Asegúrate de que `next.config.mjs` contenga la propiedad `output: 'standalone'`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Permitir imágenes externas si es necesario
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;