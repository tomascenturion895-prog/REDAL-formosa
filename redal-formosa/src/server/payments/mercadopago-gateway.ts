import axios, { type AxiosInstance } from "axios";
import { createHmac, timingSafeEqual } from "node:crypto";

import {
  PaymentsNotConfiguredError,
  type CheckoutRequest,
  type CheckoutSession,
  type PaymentGateway,
  type PaymentInfo,
  type PaymentOutcome,
  type WebhookProof,
} from "./payment-gateway";

const API_BASE = "https://api.mercadopago.com";

const OUTCOME: Record<string, PaymentOutcome> = {
  approved: "approved",
  pending: "pending",
  in_process: "pending",
  authorized: "pending",
  rejected: "failed",
  cancelled: "failed",
  refunded: "refunded",
  charged_back: "refunded",
};

interface MercadoPagoConfig {
  accessToken: string | undefined;
  webhookSecret?: string;
}

/** Adaptador de MercadoPago al puerto PaymentGateway. */
export class MercadoPagoGateway implements PaymentGateway {
  private http: AxiosInstance | null = null;

  constructor(private readonly config: MercadoPagoConfig) {}

  // El cliente HTTP se crea al primer uso: el build de Next importa este módulo sin credenciales.
  private client(): AxiosInstance {
    if (!this.config.accessToken) throw new PaymentsNotConfiguredError();
    this.http ??= axios.create({
      baseURL: API_BASE,
      headers: { Authorization: `Bearer ${this.config.accessToken}`, "Content-Type": "application/json" },
      timeout: 10_000,
    });
    return this.http;
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const { data } = await this.client().post("/checkout/preferences", {
      items: request.items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        currency_id: "ARS",
      })),
      external_reference: request.orderId,
      back_urls: request.returnUrls,
      ...(request.autoReturn ? { auto_return: "approved" } : {}),
      ...(request.notificationUrl ? { notification_url: request.notificationUrl } : {}),
    });
    // Con credenciales de prueba MercadoPago entrega sandbox_init_point.
    return { url: data.init_point ?? data.sandbox_init_point };
  }

  async getPayment(paymentId: string): Promise<PaymentInfo> {
    const { data } = await this.client().get(`/v1/payments/${encodeURIComponent(paymentId)}`);
    return {
      id: String(data.id),
      orderId: data.external_reference ?? null,
      outcome: OUTCOME[data.status] ?? "pending",
      amount: Number(data.transaction_amount),
    };
  }

  // manifest = "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" firmado con HMAC-SHA256.
  verifyWebhook({ dataId, signature, requestId }: WebhookProof): boolean {
    const secret = this.config.webhookSecret;
    if (!secret) return true; // sin secreto, la autenticidad la garantiza getPayment()
    if (!signature || !requestId) return false;

    const parts = Object.fromEntries(signature.split(",").map((p) => p.trim().split("=") as [string, string]));
    if (!parts.ts || !parts.v1) return false;

    const expected = createHmac("sha256", secret)
      .update(`id:${dataId};request-id:${requestId};ts:${parts.ts};`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.v1);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
