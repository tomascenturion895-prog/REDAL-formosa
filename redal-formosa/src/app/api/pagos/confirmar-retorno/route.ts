import { NextResponse, type NextRequest } from "next/server";

import { marcarPagado } from "@/server/payments/mp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orden_id, payment_id } = body;

    if (!orden_id) {
      return NextResponse.json({ error: "orden_id es requerido" }, { status: 400 });
    }

    // AQUÍ ACTUALIZAS TU BASE DE DATOS:
    await marcarPagado(orden_id, payment_id);

    return NextResponse.json({ ok: true, orden_id, payment_id });
  } catch (err) {
    console.error("Error confirmando retorno:", err);
    return NextResponse.json({ error: "Error confirmando retorno" }, { status: 500 });
  }
}
