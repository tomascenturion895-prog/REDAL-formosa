import { createPreference, type PreferenceItem, type CreatePreferenceData } from "@/lib/mercadopago/client";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

type Pedido = Database["public"]["Tables"]["pedidos"]["Row"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pedidoId, monto, items } = body;

    if (!pedidoId || !monto || !items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Obtener pedido para verificar datos
    const { data: pedido, error: pedidoErr } = await (supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedidoId)
      .single() as any);

    if (pedidoErr || !pedido) {
      return NextResponse.json({ error: "Pedido not found" }, { status: 404 });
    }

    // Construir items para preferencia
    const preferenceItems: PreferenceItem[] = items.map((item: any) => ({
      title: item.nombre,
      description: `Producto de emprendimiento`,
      quantity: item.cantidad,
      unit_price: item.precio_unitario,
      id: item.producto_id,
    }));

    // Datos de la preferencia
    const preferenceData: CreatePreferenceData = {
      items: preferenceItems,
      external_reference: pedidoId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacion?pedido=${pedidoId}&status=approved`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/carrito`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacion?pedido=${pedidoId}&status=pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    };

    const preference = await createPreference(preferenceData);

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creating preference:", error);
    return NextResponse.json(
      { error: "Failed to create preference" },
      { status: 500 }
    );
  }
}
