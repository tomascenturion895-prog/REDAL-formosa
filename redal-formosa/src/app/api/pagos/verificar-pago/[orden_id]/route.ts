import { NextResponse, type NextRequest } from "next/server";
import { Payment } from "mercadopago";

import { getMpConfig, buscarOrden, marcarPagado } from "@/server/payments/mp-service";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ orden_id: string }> }
) {
  try {
    const { orden_id } = await context.params;

    if (!orden_id) {
      return NextResponse.json({ error: "orden_id es requerido" }, { status: 400 });
    }

    const { mpClient } = getMpConfig();

    if (!mpClient) {
      return NextResponse.json(
        { error: "Mercado Pago no configurado" },
        { status: 400 }
      );
    }

    // 1. Primero verifica en tu base de datos si ya está confirmada
    const orden = await buscarOrden(orden_id);
    if (orden && orden.estado !== "pendiente_pago") {
      return NextResponse.json({ confirmado: true, orden });
    }

    // 2. Si sigue pendiente, consulta directamente la API de pagos de MP
    const payment = new Payment(mpClient);
    const searchRes = await payment.search({
      options: {
        external_reference: orden_id,
        sort: "date_created",
        criteria: "desc",
        limit: 5,
      },
    });

    const pagoAprobado = searchRes.results?.find(
      (p) =>
        p.status === "approved" ||
        p.status_detail === "accredited" ||
        p.status === "refunded"
    );

    if (pagoAprobado) {
      // AQUÍ ACTUALIZAS TU BASE DE DATOS:
      await marcarPagado(orden_id, pagoAprobado.id);
      return NextResponse.json({
        confirmado: true,
        payment_id: pagoAprobado.id,
        monto: pagoAprobado.transaction_amount,
      });
    }

    return NextResponse.json({ confirmado: false });
  } catch (error) {
    console.error("Error al verificar pago:", error);
    const message = error instanceof Error ? error.message : "Error al verificar pago";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
