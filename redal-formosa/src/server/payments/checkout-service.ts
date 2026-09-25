import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "@/server/errors";
import type { CheckoutItem, CheckoutSession, PaymentGateway } from "./payment-gateway";

interface CheckoutConfig {
  /** URL pública de la app, sin barra final. */
  appUrl: string;
}

/**
 * Inicia el cobro de un pedido ya creado. Todo lo que se cobra (ítems, precios, envío) se
 * lee de la base con la sesión de la persona: el navegador solo indica qué pedido paga.
 */
export class CheckoutService {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly config: CheckoutConfig,
  ) {}

  async createSession(db: Db, userId: string, orderId: string): Promise<CheckoutSession> {
    const { data: order } = await db
      .from("pedidos")
      .select("id, comprador_id, estado, monto_envio")
      .eq("id", orderId)
      .maybeSingle();

    if (!order || order.comprador_id !== userId) throw new ServiceError("not_found", "Pedido no encontrado");
    if (order.estado !== "pendiente_pago") {
      throw new ServiceError("conflict", "Este pedido ya no está pendiente de pago");
    }

    const { data: rows } = await db
      .from("pedido_items")
      .select("producto_id, cantidad, precio_unitario, producto:productos(nombre)")
      .eq("pedido_id", orderId);
    if (!rows || rows.length === 0) throw new ServiceError("conflict", "El pedido no tiene productos");

    const items: CheckoutItem[] = rows.map((row) => ({
      id: row.producto_id,
      title: row.producto?.nombre ?? "Producto",
      quantity: row.cantidad,
      unitPrice: Number(row.precio_unitario),
    }));

    const shipping = Number(order.monto_envio ?? 0);
    if (shipping > 0) items.push({ id: "envio", title: "Envío", quantity: 1, unitPrice: shipping });

    const { appUrl } = this.config;
    return this.gateway.createCheckout({
      orderId: order.id,
      items,
      returnUrls: {
        success: `${appUrl}/confirmacion?pedido=${order.id}&status=approved`,
        failure: `${appUrl}/confirmacion?pedido=${order.id}&status=failure`,
        pending: `${appUrl}/confirmacion?pedido=${order.id}&status=pending`,
      },
      // Los proveedores rechazan retorno automático y webhooks hacia URLs que no son públicas (https).
      autoReturn: appUrl.startsWith("https://"),
      notificationUrl: appUrl.startsWith("https://") ? `${appUrl}/api/webhooks/mercadopago` : undefined,
    });
  }
}
