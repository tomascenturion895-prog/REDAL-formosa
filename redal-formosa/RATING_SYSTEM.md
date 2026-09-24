# Sistema de Calificaciones

## Descripción

Sistema completo de reviews y calificaciones para productos y repartidores. Los usuarios pueden calificar, comentar y ver evaluaciones de otros.

## Características

### ✅ Calificaciones de Productos
- Escala de 1-5 estrellas
- Comentarios opcionales (hasta 500 caracteres)
- Promedio de calificaciones automático
- Historial de calificaciones por producto

### ✅ Calificaciones de Repartidores
- Misma escala 1-5
- Evaluación de desempeño
- Promedio visible en perfil

### ✅ Componentes Visuales
- `StarRating` - Mostrar puntuación
- `RatingForm` - Crear/editar calificaciones
- `RatingsList` - Lista de comentarios

### ✅ Vistas SQL
- `producto_ratings` - Promedio y totales por producto
- `repartidor_ratings` - Promedio y totales por repartidor

## Arquitectura

### Base de Datos

**Tabla `calificaciones`**
```sql
- id (UUID)
- usuario_id (UUID) - Quien califica
- producto_id (UUID) - Opcional
- repartidor_id (UUID) - Opcional
- puntuacion (INT 1-5)
- comentario (TEXT, max 500)
- creado_en, actualizado_en (TIMESTAMP)
```

**Vistas**
- `producto_ratings` - COUNT, AVG, MIN, MAX de puntuaciones
- `repartidor_ratings` - Igual para repartidores

### Servicio (`ratings-service.ts`)
```typescript
// Crear calificación
await ratingsService.createRating({
  producto_id: "uuid",
  puntuacion: 5,
  comentario: "Excelente!"
});

// Obtener calificaciones
const ratings = await ratingsService.getProductRatings(productoId);

// Obtener estadísticas
const stats = await ratingsService.getProductStats(productoId);
// Retorna: { total_ratings, promedio_puntuacion, min, max }

// Mi calificación
const myRating = await ratingsService.getUserRating(productoId);
```

## Componentes

### `<StarRating />`
```tsx
// Mostrar puntuación
<StarRating rating={4.5} interactive={false} size="lg" />

// Interactivo (para formularios)
<StarRating 
  rating={rating}
  interactive={true}
  onRate={setRating}
  size="md"
/>
```

### `<RatingForm />`
```tsx
<RatingForm
  productoId="uuid"
  onSuccess={() => reload()}
  isEditing={false}
/>
```

### `<RatingsList />`
```tsx
<RatingsList productoId="uuid" limit={10} />
```

## Rutas

### Página de Producto
- **`GET /productos/[id]`** - Detalle de producto
  - Muestra estadísticas de calificaciones
  - Formulario para calificar
  - Lista de comentarios
  - Posibilidad de editar/eliminar propia calificación

## Permisos (RLS)

- ✅ Todos pueden ver calificaciones
- ✅ Usuarios pueden crear calificaciones propias
- ✅ Usuarios pueden actualizar propias calificaciones
- ✅ Usuarios pueden eliminar propias calificaciones

## Features Implementadas

### Crear Calificación
```
Usuario abre /productos/[id]
→ Llena formulario con puntuación + comentario
→ Click "Enviar calificación"
→ Guardado en BD
→ Promedio se actualiza automáticamente
```

### Actualizar Calificación
```
Usuario ve su propia calificación
→ Click "Editar"
→ Modifica puntuación y/o comentario
→ Click "Actualizar"
→ Cambio se refleja inmediatamente
```

### Ver Estadísticas
```
En /productos/[id]:
- Promedio de puntuación (ej: 4.5/5)
- Total de calificaciones (ej: 42 reviews)
- Lista de comentarios recientes
- Mi calificación si la tengo
```

## Integración con Catálogo

En `/emprendimientos/[id]` (lista de productos):
- Cada producto muestra calificación promedio
- Cuenta de reviews
- Sin comentarios visibles (link a detalle)

## Performance

### Optimizaciones
- Índices en `producto_id`, `repartidor_id`, `usuario_id`
- Vistas SQL para evitar agregaciones en tiempo real
- Índice DESC en `creado_en` para ordenamiento rápido

### Límites
- Máximo 500 caracteres por comentario
- Puntuación 1-5 (validada en BD y frontend)
- Una calificación por usuario/producto

## Escalabilidad Futura

1. **Moderación**
   - Flag comentarios inapropiados
   - Admin revisa y oculta
   - Reporte de usuarios

2. **Análisis**
   - Heatmap de calificaciones por palabra clave
   - Tendencias en el tiempo
   - Comparación entre productos

3. **Reputación**
   - Score de "reviewer útil"
   - Ponderación por experiencia del calificador
   - Badges (verified buyer, etc)

4. **Notificaciones**
   - Email cuando reciben review
   - Notificación de respuesta a comentario

5. **Multimedia**
   - Fotos en reviews
   - Videos cortos
   - Verificación de compra

## Testing

### Casos a Probar
1. **Crear calificación**
   - Usuario no logueado → redirige a login
   - Usuario logueado → guarda en BD
   - Comentario opcional funciona
   - Puntuación 1-5 valida

2. **Editar calificación**
   - Solo autor puede editar
   - Cambios se guardan
   - Promedio se actualiza

3. **Eliminar calificación**
   - Solo autor puede eliminar
   - Confirmación ante delete
   - Promedio se recalcula

4. **Vistas de estadísticas**
   - Promedio correcto
   - Total count correcto
   - Min/max correctos

## Troubleshooting

### Calificaciones no aparecen
- Verificar RLS policies
- Revisar permisos de usuario
- Revisar tabla no esté vacía

### Promedio incorrecto
- Ejecutar: `REFRESH MATERIALIZED VIEW producto_ratings;`
- Verificar vista está actualizada

### No puedo editar mi calificación
- Verificar `usuario_id` coincida con auth user
- Revisar policy de UPDATE
- Verificar `calificacion_id` es correcto

## Documentación Oficial
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Views](https://www.postgresql.org/docs/current/sql-createview.html)
