# Wishlist/Favoritos ⭐

## Overview
Sistema completo de favoritos que permite a usuarios guardar productos para compras futuras.

## Base de Datos

### Tabla: `wishlist`
```sql
- id (UUID, PK)
- usuario_id (UUID, FK → profiles)
- producto_id (UUID, FK → productos)
- creado_en (TIMESTAMP)
- UNIQUE(usuario_id, producto_id)
```

### Índices
- `idx_wishlist_usuario` - Para queries por usuario
- `idx_wishlist_producto` - Para contar favoritos

### View: `producto_favoritos_count`
Calcula cantidad de favoritos por producto automáticamente

### RLS Policies
- ✅ SELECT: Usuario solo ve sus propios favoritos
- ✅ INSERT: Usuario puede agregar a favoritos
- ✅ DELETE: Usuario puede remover de favoritos

## Servicio

### `WishlistService` (`src/lib/wishlist/wishlist-service.ts`)

```typescript
- addToWishlist(userId, productId): Promise<boolean>
- removeFromWishlist(userId, productId): Promise<boolean>
- getWishlist(userId): Promise<WishlistItem[]>
- isInWishlist(userId, productId): Promise<boolean>
- getWishlistCount(userId): Promise<number>
- clearWishlist(userId): Promise<boolean>
```

**Características:**
- Duplicate handling automático (error 23505)
- Incluye datos del producto en getWishlist()
- Ordenado por creado_en DESC

## Componentes

### `WishlistButton`
Toggle button para agregar/remover de favoritos
- Requiere user autenticado
- Estados: ❤️ Favorito / 🤍 Agregar
- Sizes: sm, md, lg
- Callback `onToggle` opcional

**Props:**
```typescript
{
  productId: string
  onToggle?: (isFavorite: boolean) => void
  size?: "sm" | "md" | "lg"
}
```

## Rutas

### `GET /favoritos`
Página de mis favoritos

**Funcionalidad:**
- Login requerido (redirect a /login)
- Grid de 3 columnas (responsive)
- Muestra: imagen, nombre, precio
- Botones: Ver producto, remover de favoritos
- Empty state con CTA

### Integración en `/productos/[id]`
Agregado botón de wishlist en sidebar

## Navegación

Enlace "❤️ Favoritos" en menú principal entre Productos y otras opciones

## Flujos de Usuario

### Agregar a Favoritos
1. Usuario en página de producto
2. Click en "Agregar" (WishlistButton)
3. Request POST a /api/... (interno)
4. Botón cambia a "❤️ Favorito"

### Ver Favoritos
1. Click en "❤️ Favoritos" en navbar
2. Redirect a /favoritos (si no logueado)
3. Grid con todos los favoritos
4. Puede navegar a detalle o remover

### Remover de Favoritos
- Click en botón "❤️ Favorito"
- Confirma y remueve
- Refrescar lista automáticovamente

## Características Futuras

- [ ] Email cuando producto en wishlist tiene descuento
- [ ] Sincronización entre dispositivos
- [ ] Compartir wishlist con otros
- [ ] Estadísticas de productos más favoritos
- [ ] Notificaciones de restock para items en wishlist
