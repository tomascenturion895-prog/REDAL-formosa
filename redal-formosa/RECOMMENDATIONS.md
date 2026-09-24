# Recomendaciones con IA 🤖

## Overview
Sistema inteligente de recomendaciones basado en:
- Favoritos del usuario
- Historial de compras
- Productos similares
- Trending (más vendidos)
- Productos nuevos

No requiere API externa - usa SQL smart queries.

## Base de Datos

### Tabla: `product_interactions` (NEW)
Registro de interacciones usuario-producto:
- id, usuario_id, producto_id, tipo, creado_en
- Tipos: 'vista', 'favorito', 'compra'
- UNIQUE(usuario_id, producto_id, tipo)
- Preparada para futuro machine learning

### View: `productos_similares`
Calcula productos similares por:
- Mismo productor (weight 10)
- Misma categoría (weight 5)
- Otros (weight 1)

Ordenado por relevancia DESC

### View: `top_products`
Top 100 productos más vendidos:
- veces_comprado (cantidad de pedidos)
- total_vendido (suma de unidades)
- promedio_cantidad

### View: `nuevos_productos`
Top 50 productos más recientes (últimos creados)

### View: `usuario_recomendaciones_favoritos`
Para cada usuario, productos similares a sus favoritos:
- relevancia score
- razon: 'basado_en_favoritos'

### View: `usuario_recomendaciones_compras`
Para cada usuario, productos similares a sus compras:
- relevancia score
- razon: 'basado_en_compras'

## Servicio

### `RecommendationsService` (`src/lib/recommendations/recommendations-service.ts`)

```typescript
- getRecommendationsByFavorites(userId, limit): Promise<RecommendedProduct[]>
- getRecommendationsByPurchases(userId, limit): Promise<RecommendedProduct[]>
- getTrendingProducts(limit): Promise<TopProduct[]>
- getNewProducts(limit): Promise<NewProduct[]>
- getSimilarProducts(productId, limit): Promise<RecommendedProduct[]>
- getPersonalizedRecommendations(userId?, limit): Promise<RecommendedProduct[]>
- logInteraction(userId, productId, type): Promise<boolean>
```

**Características:**
- Recomendaciones personalizadas que combinan favoritos + compras
- Fallback a trending si usuario no logueado
- Helper para registrar interacciones

## Componentes

### `RecommendationsCarousel`
Carrusel horizontal de productos recomendados

**Props:**
```typescript
{
  title: string
  userId?: string | null
  type?: "personalized" | "trending" | "new" | "similar"
  productId?: string
  limit?: number
}
```

**Características:**
- Scroll horizontal con botones
- Desaparece si no hay datos
- Match score visible
- Razón de recomendación

## Rutas

### `GET /` (homepage) - ACTUALIZADA
3 secciones de recomendaciones:

1. **✨ Para ti** (si logueado)
   - Personalizado: favoritos + compras
   - Visible solo usuarios autenticados

2. **🔥 Trending**
   - Productos más vendidos
   - Visible para todos

3. **✨ Nuevos**
   - Productos más recientes
   - Visible para todos

### `GET /productos/[id]` (detalle) - ACTUALIZADA
Al final de página:
- **🔗 Productos similares**
- Basado en categoría/productor

## Algoritmo de Recomendación

### Personalizado (con usuario)
1. Obtener favoritos del usuario
2. Obtener productos similares a favoritos
3. Obtener compras del usuario
4. Obtener productos similares a compras
5. Combinar y deuplicar
6. Ordenar por relevancia
7. Limitar a N resultados

### Sin usuario
Fallback a Trending (más vendidos)

## Scoring de Relevancia

```
relevancia = 
  misma_categoria: 5
  mismo_productor: 10
```

Multiplicado por 100/10 para % visible al usuario

## Integraciones

### Homepage
- Carrusel personalizado si logueado
- Trending siempre
- Nuevos siempre

### Producto Detalle
- Carrusel de similares al final

### Futuro: Posibles integraciones
- Sidebar en dashboard
- Email: "Basado en tu historial"
- Search results: "Quizás te interese"

## Características Futuras

- [ ] Registro automático de vistas (tracking)
- [ ] Análisis de búsquedas sin resultados
- [ ] Colaborative filtering (usuarios similares)
- [ ] ML training en datos históricos
- [ ] A/B testing de algoritmos
- [ ] Explicabilidad: "¿Por qué esta recomendación?"
- [ ] Reranking por disponibilidad
- [ ] Filtro de recomendaciones duplicadas
- [ ] Push notifications: "Nuevo en tus intereses"
- [ ] Email digests: "Top 10 para ti esta semana"
