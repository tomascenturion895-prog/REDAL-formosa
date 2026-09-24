# Optimización & Producción 🚀

## Overview
Configuración completa para deployar en producción con:
- PWA (app instalable)
- SEO optimizado
- Caching estratégico
- Security headers
- Performance optimized

## PWA (Progressive Web App)

### Manifest (`public/manifest.json`)
Define la app instalable:
- Nombre, descripción, icono
- Tema de color
- Shortcuts (búsqueda, pedidos, carrito)
- Screenshots para install prompt
- Categorías

### Service Worker (`public/sw.js`)
Estrategia de caching:
- Network-first para assets
- Fallback a cache si falla red
- Excluye API calls y externos
- Auto-actualización

### PWA Installer (`src/components/pwa/pwa-installer.tsx`)
Registra service worker en cliente:
- Escucha beforeinstallprompt
- Guarda estado instalable en localStorage
- Manejo de errores

**Cómo usar:**
1. Usuario abre app en navegador
2. Verá prompt "Instalar en inicio"
3. Descarga APK-like en dispositivo
4. Acceso rápido desde home screen

## SEO

### Metadata Config (`src/lib/seo/metadata.ts`)
Configuración centralizada:
- Títulos, descripciones
- Open Graph (redes sociales)
- Twitter Cards
- Keywords
- Icons
- Manifest link

### Meta Tags en Layout
Aplicado globalmente a toda la app

### Dinámico por Página
Helper `generateProductMetadata()` para:
- Página de producto
- Búsqueda
- Categorías (futuro)

**Visible en:**
- Vista previa en redes sociales
- Google search results
- Navegadores inteligentes

## Caching Estratégico

### Headers en Next.js

**Homepage (`/`):**
- `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- 1 hora en CDN
- Fallback 24h si CDN falla

**Páginas dinámicas (`/productos/[id]`):**
- `Cache-Control: public, s-maxage=1800, stale-while-revalidate=86400`
- 30 min en CDN
- Fallback 24h

**API (`/api/*`):**
- `Cache-Control: private, no-cache, no-store, must-revalidate`
- Sin cache (siempre fresco)

### Image Optimization
- Formatos: WebP, AVIF (soporte automático)
- Lazy loading nativo
- Responsive images
- Compression

## Security Headers

```
X-Content-Type-Options: nosniff     # Previene MIME sniffing
X-Frame-Options: DENY               # Previene clickjacking
X-XSS-Protection: 1; mode=block     # Protección XSS legacy
Referrer-Policy: strict-origin...  # Control de referrer
```

## Performance

### Compresión
- `compress: true` - Gzip automático
- WebP/AVIF para imágenes

### Optimizaciones Next.js
- Code splitting automático
- Bundle analysis ready
- Font optimization (Google Fonts preconnect)

## Checklist Deploy

### Antes de deployar:
```
[ ] Verificar variables de entorno
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    - SENDGRID_API_KEY
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - TWILIO_PHONE_NUMBER
    - MERCADOPAGO_ACCESS_TOKEN (si usas)

[ ] Actualizar URLs en siteConfig
    - url: "https://tu-dominio.com"
    - ogImage: "https://tu-dominio.com/og-image.jpg"

[ ] Agregar favicon en public/
    - favicon.ico (16x16, 32x32)
    - apple-touch-icon.png (180x180)

[ ] Agregar PWA icons en public/
    - icon-192x192.png
    - icon-512x512.png
    - icon-maskable-192x192.png
    - icon-maskable-512x512.png

[ ] Crear screenshots
    - screenshot-540x720.png (mobile)
    - screenshot-1280x720.png (desktop)

[ ] Testing SEO
    - Google Search Console
    - Lighthouse audit
    - Mobile-friendly test
```

## Deploy Providers

### Vercel (recomendado)
1. Push a GitHub
2. Conectar Vercel
3. Auto-deploy en push
4. Environment variables en dashboard
5. Auto-scaling
6. Global CDN

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
```

### Railway / Render / AWS
Igual que Docker, agregar .env

## Monitoreo

### Recomendado
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Performance
- **Google Analytics 4** - User tracking

## Lighthouse Targets

| Métrica | Target |
|---------|--------|
| Performance | 90+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 95+ |
| PWA | 90+ |

## Configuración Cloudflare (opcional)

```
[ ] Enable Caching
[ ] Enable Compression
[ ] Enable Rocket Loader (JavaScript optimization)
[ ] Setup Page Rules:
    - /api/* - Cache Level: Bypass
    - /buscar* - Cache Level: Cache Everything
[ ] Enable DDoS Protection
```

## Métricas Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

Monitorear en Google Search Console

## Fallbacks & Offline

- Service Worker cachea assets
- Offline fallback básico
- API calls fallan gracefully
- Mensajes user-friendly

## Testing Antes de Deploy

```bash
# Build local
npm run build

# Test performance
npm run build && npx lighthouse http://localhost:3000

# Test PWA
# - Abrir en Chrome DevTools
# - Pestaña Application
# - Service Workers
# - Ver manifest.json
```
