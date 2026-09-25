// Puerto de pagos: el resto del servidor depende de esta interfaz, no de MercadoPago.
// Cambiar de proveedor (o usar uno falso en tests) es escribir otro adaptador.

export interface CheckoutItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutRequest {
  orderId: string;
  items: CheckoutItem[];
  returnUrls: { success: string; failure: string; pending: string };
  /** Solo si la app es pública (https): los proveedores rechazan webhooks a localhost. */
  notificationUrl?: string;
  autoReturn: boolean;
}

export interface CheckoutSession {
  url: string;
}

export type PaymentOutcome = "approved" | "pending" | "failed" | "refunded";

export interface PaymentInfo {
  id: string;
  orderId: string | null;
  outcome: PaymentOutcome;
  amount: number;
}

export interface WebhookProof {
  dataId: string;
  signature: string | null;
  requestId: string | null;
}

export interface PaymentGateway {
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  /** Consulta el pago directamente al proveedor: lo recibido por HTTP nunca se toma como verdad. */
  getPayment(paymentId: string): Promise<PaymentInfo>;
  verifyWebhook(proof: WebhookProof): boolean;
}

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super("El proveedor de pagos no está configurado");
    this.name = "PaymentsNotConfiguredError";
  }
}
