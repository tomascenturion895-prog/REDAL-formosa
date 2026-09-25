export interface NotificationPreferences {
  email_confirmacion: boolean;
  email_estado_pedido: boolean;
  email_ofertas: boolean;
  sms_confirmacion: boolean;
  sms_estado_pedido: boolean;
}

/** Valores que aplican mientras la persona no haya guardado sus preferencias. */
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_confirmacion: true,
  email_estado_pedido: true,
  email_ofertas: true,
  sms_confirmacion: false,
  sms_estado_pedido: false,
};
