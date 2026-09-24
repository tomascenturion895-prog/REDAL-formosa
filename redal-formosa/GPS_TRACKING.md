# Tracking GPS en Tiempo Real

## Descripción

Sistema de seguimiento en vivo para repartidores y clientes. Los repartidores comparten su ubicación en tiempo real, y los clientes pueden ver dónde está su pedido en un mapa interactivo.

## Características

### ✅ Para Repartidores
- Compartir ubicación en tiempo real
- Activar/desactivar tracking
- Ver velocidad actual
- Gestionar múltiples pedidos

### ✅ Para Clientes
- Ver ubicación del repartidor en mapa
- Distancia al destino
- Velocidad del repartidor
- Última actualización en vivo

### ✅ Mapa Interactivo
- Basado en Leaflet (OpenStreetMap)
- Marcador de repartidor (azul)
- Marcador de destino (verde)
- Línea de ruta actualizada

## Arquitectura

### Geolocalización (`src/lib/geolocation/geo-service.ts`)
```typescript
// Obtener ubicación actual
const coords = await geoService.getCurrentLocation();

// Monitorear ubicación en tiempo real
geoService.watchLocation(
  (coords) => console.log(coords),
  (error) => console.error(error)
);

// Calcular distancia entre dos puntos
const km = geoService.calculateDistance(lat1, lon1, lat2, lon2);
```

### Realtime Tracking (`src/lib/realtime/tracking-service.ts`)
```typescript
// Actualizar ubicación del repartidor en BD
await trackingService.updateRepartidorLocation(repartidorId, coords);

// Suscribirse a cambios de ubicación
trackingService.subscribeToRepartidorTracking(repartidorId, (location) => {
  console.log("Nueva ubicación:", location);
});

// Obtener ubicación actual
const location = await trackingService.getRepartidorCurrentLocation(repartidorId);

// Obtener historial
const history = await trackingService.getLocationHistory(repartidorId);
```

## Componentes

### `MapComponent` - Mapa Interactivo
```tsx
<MapComponent
  repartidorLocation={location}
  destino={{ lat: -25.4971, lng: -55.504 }}
  className="w-full h-96"
/>
```

### `RepartidorTracker` - Tracker Completo
```tsx
// Para repartidores
<RepartidorTracker
  repartidorId="uuid"
  destino={{ lat: -25.4971, lng: -55.504 }}
  isRepartidor={true}
/>

// Para clientes
<RepartidorTracker
  repartidorId="uuid"
  destino={{ lat: -25.4971, lng: -55.504 }}
  isRepartidor={false}
/>
```

## Rutas

### Cliente
- **`GET /tracking/[pedidoId]`** - Ver seguimiento de pedido
  - Requiere: user autenticado
  - Muestra: mapa con ubicación del repartidor
  - Actualización: en tiempo real con Supabase Realtime

### Repartidor
- **`GET /tracking`** (productor) - Panel de tracking
  - Requiere: ser repartidor registrado
  - Muestra: lista de pedidos + tracking activo
  - Actualización: GPS en tiempo real

## Base de Datos

### Tabla `ubicaciones_tiempo_real`
```sql
CREATE TABLE ubicaciones_tiempo_real (
  id UUID PRIMARY KEY,
  repartidor_id UUID REFERENCES repartidores(id),
  latitud DECIMAL(9, 6),
  longitud DECIMAL(9, 6),
  exactitud DECIMAL(10, 2),
  velocidad DECIMAL(8, 2),
  rumbo DECIMAL(6, 2),
  actualizado_en TIMESTAMP
);
```

### Tabla `repartidores` - Nuevas columnas
```sql
ALTER TABLE repartidores ADD COLUMN pedido_id UUID;
```

## Permisos y Seguridad

### RLS Policies
- Repartidores solo pueden actualizar su propia ubicación
- Clientes solo ven ubicación de su repartidor asignado
- Datos se limpian después de 7 días

### Geolocalización
- Requiere permiso del usuario
- Funciona solo en HTTPS (excepto localhost)
- Precisión: ~10 metros con GPS habilitado

## Casos de Uso

### 1. Cliente Siguiendo su Pedido
```
Cliente entra a /tracking/[pedidoId]
→ Se suscribe a ubicación del repartidor
→ Ve mapa actualizado cada ~5 segundos
→ Ve distancia y tiempo estimado
```

### 2. Repartidor En Ruta
```
Repartidor accede a /tracking (panel)
→ Activa tracking de su dispositivo
→ Ubicación se envía cada ~10 segundos
→ Clientes reciben actualizaciones en tiempo real
```

## Configuración

### Variables de Entorno
```bash
# No requiere variables adicionales
# Usa Supabase Realtime (incluido en configuración)
```

### Permisos Requeridos
- `Geolocation` (navegador)
- `HTTPS` en producción

## Performance

### Optimizaciones
- Batching de actualizaciones de ubicación
- Índices en `repartidor_id` y `actualizado_en`
- Limpieza automática de datos antiguos
- Throttling de actualizaciones

### Límites
- Máximo 100 puntos de historial por repartidor
- Datos se limpian después de 7 días
- Actualización máxima: cada 5 segundos

## Próximas Mejoras

1. **Estimación de Tiempo de Llegada**
   - Calcular ETA basado en velocidad actual
   - Considerar tráfico histórico

2. **Rutas Optimizadas**
   - Calcular ruta más eficiente
   - Multi-destino (varios pedidos)

3. **Notificaciones Push**
   - Notificar a cliente cuando repartidor está cerca
   - Alerta cuando pendiente de entrega

4. **Análisis de Rutas**
   - Dashboard con estadísticas
   - Optimizar rutas diarias

5. **Validación de Entrega**
   - Foto de firma/recepción
   - Geolocalización en momento de entrega

## Troubleshooting

### "Geolocalización no soportada"
- Verificar HTTPS en producción
- Habilitar permisos en navegador
- Probar en navegador reciente

### Ubicación no actualiza
- Verificar conexión a internet
- Revisar permisos de geolocalización
- Revisar permisos en BD (RLS)

### Mapa no carga
- Verificar conexión a OpenStreetMap
- Revisar Leaflet está instalado
- Revisar CSS esté cargando

## Documentación Oficial
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Leaflet.js](https://leafletjs.com/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
