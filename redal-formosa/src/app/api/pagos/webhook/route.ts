import { NextResponse, type NextRequest } from "next/server";
import { Payment } from "mercadopago";

import { getMpConfig, marcarPagado } from "@/server/payments/mp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type, data } = body;
    const { mpClient } = getMpConfig();

    const paymentId = data?.id || req.nextUrl.searchParams.get("data.id") || req.nextUrl.searchParams.get("id");
    const isPayment = type === "payment" || req.nextUrl.searchParams.get("type") === "payment" || req.nextUrl.searchParams.get("topic") === "payment";

    if (isPayment && paymentId && mpClient) {
      const paymentInstance = new Payment(mpClient);
      const paymentData = await paymentInstance.get({ id: String(paymentId) });

      if (paymentData && paymentData.status === "approved") {
        const ordenId = paymentData.external_reference;
        if (ordenId) {
          // AQUÍ ACTUALIZAS TU BASE DE DATOS:
          await marcarPagado(ordenId, paymentData.id);
          console.log(`✅ Orden ${ordenId} pagada con éxito (Payment ID: ${paymentData.id})`);
        }
      }
    }

    // Mercado Pago requiere status 200 OK para no reintentar
    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Error en Webhook:", err);
    return new NextResponse("OK", { status: 200 });
  }
}
