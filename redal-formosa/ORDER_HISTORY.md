# Historial de Pedidos Mejorado 📜

## Overview
Sistema completo de historial de compras con detalles, estadísticas y filtros por estado.

## Base de Datos

### View: `usuario_pedidos`
Resumen de todos los pedidos del usuario con conteos:
- id, usuario_id, estado, total, timestamps
- cantidad_items, total_unidades, detalles_count

### View: `pedido_detalles_completos`
Detalles completos de cada item en cada pedido:
- Información del producto (nombre, imagen, unidad)
- Cantidad, precio unitario, subtotal
- Estado del pedido, usuario, total, fecha

### View: `usuario_compras_stats`
Estadísticas de compras del usuario:
- total_pedidos, gasto_total, gasto_promedio
- productos_diferentes, total_unidades
- ultimo_pedido (timestamp)

Nota: Excluye pedidos cancelados

### Índices
- `idx_usuario_pedidos_usuario` - Query por usuario
- `idx_usuario_pedidos_estado` - Filter por estado
- `idx_detalle_pedido_producto` - Join con productos
- `idx_detalle_pedido_pedido` - Join con pedidos

## Servicio

### `OrderHistoryService` (`src/lib/orders/order-history-service.ts`)

```typescript
- getOrders(userId, limit): Promise<OrderSummary[]>
- getOrderDetails(orderId, userId): Promise<OrderDetail[]>
- getStats(userId): Promise<OrderStats | null>
- getOrder(orderId): Promise<OrderSummary | null>
- getOrdersByStatus(userId, status): Promise<OrderSummary[]>
- getRecentOrders(userId): Promise<OrderSummary[]>
- getStatusEmoji(status): string
- getStatusLabel(status): string
```

**Características:**
- Validación de permisos (usuario_id)
- Manejo de errores
- Helper methods para UI (emoji, labels)

## Componentes

### `OrderCard`
Tarjeta de resumen de un pedido
- Link a detalle
- Estado con color y emoji
- Fecha, items, unidades, total
- Hover effect

### `OrderItem`
Item dentro de un pedido
- Imagen, nombre, unidad
- Cantidad, precio unitario
- Subtotal
- Link al producto

## Rutas

### `GET /mis-pedidos`
Página con lista de pedidos del usuario

**Funcionalidad:**
- Login requerido (redirect a /login)
- Tarjetas de resumen de pedidos
- Estadísticas: total pedidos, gasto, promedio, productos, unidades
- Filtros por estado (Todos, Pendiente, Confirmado, etc.)
- Contador de pedidos por estado
- Empty state con CTA

**Estados soportados:**
- pendiente (⏳)
- confirmado (✓)
- en_preparacion (📦)
- en_trayecto (🚚)
- entregado (✓✓)
- cancelado (✗)

### `GET /mis-pedidos/[id]`
Página de detalle de un pedido específico

**Funcionalidad:**
- Login requerido
- Validación de permisos (usuario puede ver solo sus pedidos)
- Información completa: estado, fecha, timestamp actualización
- Lista de items con detalles completos
- Resumen de totales
- Link "Seguir comprando"
- Link de volver a mis pedidos

## Navegación

Enlace "📋 Mis Pedidos" en menú principal

## Flujos de Usuario

### Ver Historial de Pedidos
1. Click en "📋 Mis Pedidos" en navbar
2. Redirect a /mis-pedidos (si no logueado)
3. Ver estadísticas y lista de pedidos
4. Filtrar por estado si lo desea

### Ver Detalles de un Pedido
1. En /mis-pedidos, click en un pedido
2. Ir a /mis-pedidos/[id]
3. Ver detalles completos:
   - Estado actual
   - Todos los items comprados
   - Precios y cantidades
   - Fechas de creación y último cambio
4. Click en un producto para ver detalle
5. Click "Seguir comprando" para volver a catálogo

### Filtrar por Estado
1. En /mis-pedidos, click en botón de estado
2. Ver solo pedidos con ese estado
3. Contador automático por estado

## Características Futuras

- [ ] Descargar factura PDF
- [ ] Imprimir remito
- [ ] Seguimiento en tiempo real
- [ ] Notificaciones de cambio de estado
- [ ] Calificación post-entrega
- [ ] Repedido (repetir último pedido)
- [ ] Exportar historial CSV
- [ ] Cancelar pedido (si es posible)
- [ ] Cambio de dirección si no fue enviado
