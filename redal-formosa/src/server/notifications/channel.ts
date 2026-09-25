export interface NotificationMessage {
  subject?: string;
  text: string;
  html?: string;
}

/**
 * Un canal de entrega (email, SMS...). Estrategia intercambiable: para sumar WhatsApp
 * se escribe otro canal, sin modificar a quien notifica.
 */
export interface NotificationChannel {
  readonly kind: "email" | "sms";
  isConfigured(): boolean;
  /** Lanza un Error si el proveedor rechaza el envío. */
  send(to: string, message: NotificationMessage): Promise<void>;
}
