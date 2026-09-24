import { createClient } from "@/lib/supabase/server";
import { getPaymentInfo } from "@/lib/mercadopago/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    // MercadoPago envía notificaciones con type: payment o type: plan
    if (type !== "payment") {
      return NextResponse.json({ status: "ok" });
    }

    const paymentId = data.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    // Obtener info del pago desde MercadoPago
    const payment = await getPaymentInfo(paymentId);

    if (!payment.external_reference) {
      return NextResponse.json({ error: "No pedido reference" }, { status: 400 });
    }

    const pedidoId = payment.external_reference;
    const supabase = await createClient();

    // Mapear estado de MercadoPago a nuestros estados
    let paymentStatus = "pendiente";
    if (payment.status === "approved") paymentStatus = "aprobado";
    else if (payment.status === "pending") paymentStatus = "pendiente";
    else if (payment.status === "rejected") paymentStatus = "rechazado";
    else if (payment.status === "cancelled") paymentStatus = "cancelado";

    // Actualizar pago
    const paymentData = {
      estado: paymentStatus,
      referencia_externa: paymentId.toString(),
      actualizado_en: new Date().toISOString(),
    };
    const { error: paymentErr } = await (supabase as any)
      .from("pagos")
      .update(paymentData)
      .eq("pedido_id", pedidoId);

    if (paymentErr) {
      console.error("Error updating payment:", paymentErr);
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }

    // Si el pago fue aprobado, actualizar estado del pedido
    if (paymentStatus === "aprobado") {
      const pedidoData = {
        estado: "confirmado",
        actualizado_en: new Date().toISOString(),
      };
      const { error: pedidoErr } = await (supabase as any)
        .from("pedidos")
        .update(pedidoData)
        .eq("id", pedidoId);

      if (pedidoErr) {
        console.error("Error updating pedido:", pedidoErr);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
