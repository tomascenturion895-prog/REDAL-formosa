# Búsqueda Full-Text 🔍

## Overview
Sistema completo de búsqueda con filtros, autocompletado y ranking de relevancia usando PostgreSQL full-text search.

## Base de Datos

### Columna: `search_vector`
Columna GENERATED con índice GIN en tabla `productos`:
- Combina nombre, descripción, unidad
- Pesos A (nombre), B (descripción), C (unidad)
- Actualiza automáticamente en cambios

### Función SQL: `search_productos()`
Busca con filtros y ranking:
```sql
search_productos(
  search_query: TEXT,
  price_min: NUMERIC,
  price_max: NUMERIC,
  disponible_only: BOOLEAN
) → SearchResult[]
```

**Características:**
- Full-text search con plainto_tsquery (robusto)
- Filtro por rango de precio
- Filtro disponibilidad
- Ranking automático (ts_rank)
- Límite 50 resultados ordenados por relevancia

### View: `categoria_stats`
Estadísticas automáticas por categoría:
- Total productos
- Precio promedio, mínimo, máximo
- Cantidad disponibles

### Índices
- `idx_productos_search_vector` - GIN para búsqueda eficiente

## Servicio

### `SearchService` (`src/lib/search/search-service.ts`)

```typescript
- search(filters: SearchFilters): Promise<SearchResult[]>
- getCategories(): Promise<Category[]>
- simpleSearch(query, limit): Promise<SearchResult[]>
- autocomplete(query, limit): Promise<string[]>
- searchByCategory(categoria, priceMin?, priceMax?): Promise<SearchResult[]>
```

**Fallback:**
- Si RPC falla, usa ilike simple (busca en nombre/descripción)
- Ignora case automaticamente

## Componentes

### `SearchBox`
Input de búsqueda reutilizable
- Integrado en header (visible en todas páginas)
- On submit → redirect a `/buscar?q=...`
- Estilos dinámicos (focus con border action)

**Props:**
```typescript
{
  placeholder?: string
  onSearch?: (query: string) => void
}
```

### `SearchFilters`
Panel de filtros en sidebar
- Rango de precio (inputs mín/máx)
- Checkbox "Solo disponibles"
- Botón "Limpiar filtros"
- Callback onChange

**Props:**
```typescript
{
  onFilterChange: (filters: FilterState) => void
  maxPrice?: number
}
```

## Rutas

### `GET /buscar?q=...`
Página de resultados de búsqueda

**Funcionalidad:**
- Suspense boundary para useSearchParams
- Grid de 2 columnas (responsive)
- Sidebar con filtros (left)
- Resultados principales (right)
- Empty state con enlace a catálogo
- Actualiza automáticamente al cambiar filtros

**Datos mostrados:**
- Imagen, nombre, descripción (truncada)
- Precio, disponibilidad
- Link a detalle del producto

## Navegación

SearchBox integrado en header (visible siempre)
- Responsive: full width en mobile, 96 width (24rem) en desktop

## Flujos de Usuario

### Buscar Producto
1. Escribe en SearchBox en header
2. Press enter o click buscar
3. Redirect a `/buscar?q=...`
4. Resultados con relevancia

### Aplicar Filtros
1. En página `/buscar`, cambiar filtros
2. Min/Max precio, disponibilidad
3. Results actualizan en tiempo real
4. Contador de resultados

### Autocompletado (preparado)
- `searchService.autocomplete(query)` listo
- Solo requiere UI component (Combobox)

### Búsqueda por Categoría (preparado)
- `searchService.searchByCategory(cat, min, max)` listo
- Útil para breadcrumbs o facets

## Características Futuras

- [ ] Autocompletado UI con dropdown
- [ ] Búsqueda por categoría (breadcrumbs)
- [ ] Ordenamiento (relevancia/precio/nuevo)
- [ ] Historial de búsquedas
- [ ] Búsqueda avanzada (filtros más complejos)
- [ ] Analytics (qué se busca, sin resultados)
- [ ] Spell checker (¿Quisiste decir...?)
