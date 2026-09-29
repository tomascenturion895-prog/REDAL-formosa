import { NextResponse, type NextRequest } from "next/server";
import { Preference } from "mercadopago";

import { getMpConfig } from "@/server/payments/mp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orden_id, monto, titulo_item, cliente_nombre, cliente_email } = body;

    if (!orden_id || !monto) {
      return NextResponse.json(
        { error: "orden_id y monto son requeridos" },
        { status: 400 }
      );
    }

    const { mpClient, esSandbox, clientUrl, backendUrl } = getMpConfig();

    if (!mpClient) {
      return NextResponse.json(
        { error: "Mercado Pago no está configurado" },
        { status: 500 }
      );
    }

    const isLocalhost =
      clientUrl.includes("localhost") || clientUrl.includes("127.0.0.1");

    const preference = new Preference(mpClient);

    const preferenceBody: Parameters<typeof preference.create>[0]["body"] = {
      items: [
        {
          id: String(orden_id),
          title: titulo_item || `Orden #${orden_id}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: Number(monto),
        },
      ],
      payer: {
        name: cliente_nombre || "Cliente",
        email: cliente_email || "cliente@ejemplo.com",
      },
      // URLs a las que MP redirige tras finalizar el pago
      back_urls: {
        success: `${clientUrl}/confirmacion?pago=aprobado&orden_id=${orden_id}&pedido=${orden_id}`,
        failure: `${clientUrl}/confirmacion?pago=fallido&orden_id=${orden_id}&pedido=${orden_id}&status=failure`,
        pending: `${clientUrl}/confirmacion?pago=pendiente&orden_id=${orden_id}&pedido=${orden_id}`,
      },
      // external_reference: Clave para identificar la orden en tu base de datos
      external_reference: String(orden_id),
      statement_descriptor: "REDAL FORMOSA",
    };

    // auto_return solo funciona en dominios públicos (no localhost directo)
    if (!isLocalhost) {
      preferenceBody.auto_return = "approved";
    }

    // Webhook para producción (requiere HTTPS o ngrok)
    if (backendUrl && !backendUrl.includes("localhost")) {
      preferenceBody.notification_url = `${backendUrl}/api/pagos/webhook`;
    }

    const prefResponse = await preference.create({ body: preferenceBody });

    // En sandbox se usa sandbox_init_point, en producción init_point
    const checkoutUrl = esSandbox
      ? prefResponse.sandbox_init_point || prefResponse.init_point
      : prefResponse.init_point;

    return NextResponse.json({
      ok: true,
      preference_id: prefResponse.id,
      init_point: prefResponse.init_point,
      sandbox_init_point: prefResponse.sandbox_init_point,
      checkout_url: checkoutUrl, // URL para abrir o generar el QR
    });
  } catch (error) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    const message = error instanceof Error ? error.message : "Error al crear preferencia";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
