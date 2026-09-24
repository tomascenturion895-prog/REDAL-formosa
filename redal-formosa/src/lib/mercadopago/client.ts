import axios from "axios";

const MP_API_BASE = "https://api.mercadopago.com";
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

if (!MP_ACCESS_TOKEN) {
  console.warn("MERCADOPAGO_ACCESS_TOKEN not set. MercadoPago integration will not work.");
}

const mpClient = axios.create({
  baseURL: MP_API_BASE,
  headers: {
    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export interface PreferenceItem {
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  id?: string;
}

export interface CreatePreferenceData {
  items: PreferenceItem[];
  payer?: {
    name?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: number;
      zip_code?: string;
    };
  };
  external_reference: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: "approved" | "all";
  notification_url?: string;
  metadata?: Record<string, any>;
}

export async function createPreference(data: CreatePreferenceData) {
  try {
    const response = await mpClient.post("/checkout/preferences", data);
    return response.data;
  } catch (error) {
    console.error("Error creating MercadoPago preference:", error);
    throw error;
  }
}

export async function getPaymentInfo(paymentId: string) {
  try {
    const response = await mpClient.get(`/v1/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment info:", error);
    throw error;
  }
}

export function verifyNotification(body: any, signature: string, requestId: string): boolean {
  // Implementar verificación de firma de webhook
  // Por ahora retornar true para desarrollo
  return true;
}
