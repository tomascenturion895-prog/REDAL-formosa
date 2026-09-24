# Integración de MercadoPago

## Configuración

### 1. Obtener Credenciales
1. Crear cuenta en [MercadoPago](https://www.mercadopago.com.ar)
2. Ir a Panel de Control → Credenciales
3. Copiar **Access Token** de la sección "Token de acceso"
4. Para modo sandbox, usar token de prueba

### 2. Variables de Entorno
Copiar `.env.example` a `.env.local` y completar:

```bash
MERCADOPAGO_ACCESS_TOKEN=your-access-token-here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # En producción: https://tu-dominio.com
```

### 3. Aplicar Migraciones
```bash
# En Supabase Studio, ejecutar:
supabase\migrations\20260924000002_add_mercadopago_columns.sql
```

## Características Implementadas

### ✅ Crear Preferencia de Pago
- Endpoint: `POST /api/checkout/create-preference`
- Recibe: `pedidoId`, `monto`, `items`
- Retorna: `initPoint` (URL para checkout)

### ✅ Webhooks de Notificación
- Endpoint: `POST /api/webhooks/mercadopago`
- Recibe notificaciones de MercadoPago
- Actualiza estado de pago y pedido automáticamente

### ✅ Flujo Completo de Checkout
```
Carrito → Checkout → MercadoPago → Confirmación → Webhook
```

### ✅ Estados de Pago
- `pendiente` - En espera de pago
- `aprobado` - Pago completado
- `rechazado` - Pago rechazado
- `cancelado` - Pago cancelado

## Edge Function: Validación Biométrica

Ubicación: `supabase/functions/validate-biometric/index.ts`

### Uso
```typescript
const response = await fetch(
  `https://your-project.supabase.co/functions/v1/validate-biometric`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      dni_front_url: "https://...",
      dni_back_url: "https://...",
      selfie_url: "https://...",
    }),
  }
);
```

## Testing en Sandbox

### Tarjetas de Prueba
- **Aprobada**: 4111 1111 1111 1111
- **Rechazada**: 4222 2222 2222 2222
- **Pendiente**: 4000 0000 0000 0000

### URLs de Retorno
Después de pagar, serás redirigido a:
- Aprobado: `/confirmacion?pedido={id}&status=approved`
- Rechazado: `/carrito`
- Pendiente: `/confirmacion?pedido={id}&status=pending`

## Próximos Pasos

1. **Integrar SDK de MercadoPago en el Frontend** (opcional)
   ```bash
   npm install @mercadopago/sdk-js
   ```

2. **Validación de Webhooks** 
   - Implementar verificación de firma en el webhook handler
   - Usar `X-Signature` header para validar autenticidad

3. **Mejoras en Edge Function**
   - Integrar con API de validación de identidad (ej: easypost, trulioo)
   - Análisis de documentos con IA

4. **Notificaciones**
   - Email de confirmación de pago
   - SMS con estado del pedido

## Documentación Oficial
- [API de MercadoPago](https://developers.mercadopago.com/es/reference)
- [Webhook Notifications](https://developers.mercadopago.com/es/docs/checkout-api/how-tos/notifications)
- [Test Cards](https://developers.mercadopago.com/es/docs/checkout-api/how-tos/test-cards)
