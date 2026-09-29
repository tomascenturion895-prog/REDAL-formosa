import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "@/server/errors";
import { logError } from "@/server/logger";
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
    /** Service role: guarda la preferencia creada para reutilizarla. Sin él, cada intento crea una nueva. */
    private readonly admin?: Db,
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

    // Un solo enlace de pago por pedido: si ya se creó, se devuelve el mismo. Así no hay dos cobros posibles.
    const { data: existing } = await db.from("pagos").select("preferencia_mp_id, referencia_externa").eq("pedido_id", orderId).maybeSingle();
    if (existing?.preferencia_mp_id && existing.referencia_externa?.startsWith("https://")) {
      return { url: existing.referencia_externa, id: existing.preferencia_mp_id };
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
    const session = await this.gateway.createCheckout({
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

    // Guardar el enlace es una mejora, no un requisito: si falla, el pago igual puede hacerse.
    if (this.admin && session.id) {
      const { error } = await this.admin
        .from("pagos")
        .update({ preferencia_mp_id: session.id, referencia_externa: session.url })
        .eq("pedido_id", order.id);
      if (error) logError(`No se pudo guardar la preferencia ${session.id} del pedido ${order.id}`, error.message);
    }
    return session;
  }
}
