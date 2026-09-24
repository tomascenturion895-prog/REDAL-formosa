# Sistema de Notificaciones

## Descripción

Sistema completo de notificaciones por Email y SMS. Permite a los usuarios recibir confirmaciones, actualizaciones de estado y ofertas especiales.

## Características

### ✅ Notificaciones por Email
- Confirmación de registro
- Confirmación de pedidos
- Actualizaciones de estado
- Recordatorios de carrito abandonado
- Ofertas y promociones

### ✅ Notificaciones por SMS
- Confirmación de pedidos
- Actualizaciones urgentes
- Alertas importantes

### ✅ Preferencias Personalizadas
- Usuarios controlan qué notificaciones reciben
- Opción de deshabilitar categorías
- Configuración por canal (Email/SMS)

### ✅ Auditoría y Logs
- Todas las notificaciones se registran
- Historial de envíos
- Estados: pendiente, enviado, fallido

## Configuración

### 1. SendGrid (para Emails)
```bash
# Crear cuenta en https://sendgrid.com/
# Obtener API Key desde Dashboard
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
```

### 2. Twilio (para SMS)
```bash
# Crear cuenta en https://www.twilio.com/
# Obtener credenciales desde Console
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

## Arquitectura

### Tablas de Base de Datos

**`notificaciones`** - Auditoría de todos los envíos
```sql
- id (UUID)
- usuario_id (UUID)
- tipo (email/sms/push)
- asunto (para emails)
- cuerpo (contenido)
- destinatario (email o teléfono)
- estado (pendiente/enviado/fallido)
- intento_numero
- ultimo_error
- referencia_externa (SendGrid/Twilio ID)
- creado_en, enviado_en
```

**`preferencias_notificaciones`** - Preferencias del usuario
```sql
- usuario_id (UUID)
- email_confirmacion (BOOL)
- email_estado_pedido (BOOL)
- email_ofertas (BOOL)
- sms_confirmacion (BOOL)
- sms_estado_pedido (BOOL)
```

### Servicio (`notifications-service.ts`)

```typescript
// Enviar email
await notificationsService.sendEmail({
  to: "user@example.com",
  subject: "Confirmación de pedido",
  html: "<h1>Pedido confirmado</h1>",
});

// Enviar SMS
await notificationsService.sendSMS({
  to: "+541234567890",
  body: "Tu pedido ha sido confirmado",
});

// Registrar en BD
await notificationsService.logNotification({
  usuario_id: "uuid",
  tipo: "email",
  asunto: "Confirmación",
  cuerpo: "...",
  destinatario: "user@email.com",
});

// Obtener preferencias
const prefs = await notificationsService.getPreferences(userId);

// Actualizar preferencias
await notificationsService.updatePreferences(userId, {
  email_confirmacion: true,
  sms_confirmacion: false,
});

// Historial
const history = await notificationsService.getHistory(userId);
```

## Componentes

### `<NotificationPreferences />`
```tsx
<NotificationPreferences />
```

Muestra interfaz para cambiar preferencias de notificaciones

## Endpoints API

### Enviar Email
**POST** `/api/notifications/send-email`

```json
{
  "to": "user@example.com",
  "subject": "Asunto",
  "html": "<html>...</html>",
  "userId": "uuid" // Opcional, para registrar
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### Enviar SMS
**POST** `/api/notifications/send-sms`

```json
{
  "to": "+541234567890",
  "body": "Mensaje de texto",
  "userId": "uuid" // Opcional
}
```

## Templates de Email

Ubicación: `src/lib/notifications/email-templates.ts`

### Disponibles
1. **welcomeEmail** - Bienvenida
2. **orderConfirmationEmail** - Confirmación de pedido
3. **orderStatusEmail** - Actualización de estado
4. **cartAbandonedEmail** - Recordatorio carrito
5. **specialOfferEmail** - Oferta especial

### Uso
```typescript
import { emailTemplates } from "@/lib/notifications/email-templates";

const template = emailTemplates.orderConfirmationEmail(
  "Juan",
  "PED-12345",
  499.99,
  "Calle 1, 123"
);

await notificationsService.sendEmail({
  to: "juan@example.com",
  ...template,
});
```

## Rutas

### Configuración de Notificaciones
- **`GET /configuracion/notificaciones`** - Panel de preferencias
  - Requiere usuario autenticado
  - Mostrar preferencias actuales
  - Permitir cambios
  - Guardar en BD

## Flujos de Integración

### 1. Confirmación de Pedido
```
Usuario completa checkout
→ Crear pedido en BD
→ Enviar email de confirmación
→ Enviar SMS si está habilitado
→ Registrar en auditoría
→ Mostrar página de confirmación
```

### 2. Actualización de Estado
```
Repartidor actualiza estado del pedido
→ Sistema detecta cambio
→ Verifica preferencias del usuario
→ Envía notificación si está habilitada
→ Registra en auditoría
```

### 3. Oferta Especial
```
Admin crea oferta
→ Sistema identifica usuarios elegibles
→ Verifica preferencias
→ Envía email/SMS a interesados
→ Registra en auditoría
```

## Performance

### Optimizaciones
- Índices en `usuario_id`, `tipo`, `estado`
- Índice DESC en `creado_en`
- Queries asincrónicas
- Validación cliente-lado

### Límites
- Máximo 100 notificaciones por usuario en historio
- Rate limiting: 5 emails/min por usuario
- SMS: máximo 2 por pedido

## Escalabilidad Futura

1. **Queue System**
   - Bull/Hangfire para encolar envíos
   - Retry automático en caso de fallo
   - Priorización de mensajes urgentes

2. **Push Notifications**
   - Firebase Cloud Messaging
   - Web Push API
   - Notificaciones en tiempo real

3. **Webhooks**
   - Confirmar deliver de SendGrid
   - Confirmar delivery de Twilio
   - Actualizar estado automáticamente

4. **Análisis**
   - Tasa de apertura de emails
   - Tasa de click
   - Conversión desde notificación

5. **Personalización**
   - A/B testing de subject lines
   - Segmentación avanzada
   - Timing óptimo de envío

## Testing

### Casos a Probar
1. **Envío de Email**
   - SendGrid conectado
   - Template se genera correctamente
   - Datos se guardan en BD

2. **Envío de SMS**
   - Twilio conectado
   - Número válido
   - Contenido dentro del límite

3. **Preferencias**
   - Usuario puede cambiar
   - Se guardan correctamente
   - Se respetan en notificaciones

4. **Auditoría**
   - Todos los envíos se registran
   - Estados se actualizan
   - Historial es accesible

## Troubleshooting

### Email no se envía
- Verificar `SENDGRID_API_KEY`
- Revisar que el email destino sea válido
- Verificar quotas en SendGrid dashboard

### SMS no se envía
- Verificar credenciales de Twilio
- Validar formato de teléfono (+código país)
- Revisar balance de SMS

### Preferencias no se guardan
- Verificar RLS policies
- Revisar permisos en BD
- Verificar usuario_id es correcto

## Documentación Oficial
- [SendGrid API](https://docs.sendgrid.com/api-reference/)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Email Best Practices](https://www.twilio.com/docs/sms/best-practices)
