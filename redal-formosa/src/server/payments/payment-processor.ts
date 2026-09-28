import type { Db } from "@/lib/supabase/types";
import type { OrderEventBus } from "@/server/events/order-events";
import { ServiceError } from "@/server/errors";
import type { PaymentGateway, PaymentOutcome } from "./payment-gateway";

export interface PaymentNotification {
  type?: string;
  dataId?: string;
  signature: string | null;
  requestId: string | null;
}

export type ProcessResult = { status: "ignored" } | { status: "processed"; orderId: string; paid: boolean; cancelled: boolean };

type PaymentRowState = "aprobado" | "pendiente" | "fallido" | "reembolsado";

const ROW_STATE: Record<PaymentOutcome, PaymentRowState> = {
  approved: "aprobado",
  pending: "pendiente",
  failed: "fallido",
  refunded: "reembolsado",
};

// Estados en los que el pedido todavía no salió: si se devuelve el dinero, hay que frenarlo.
const NOT_YET_SHIPPED = ["pagado", "en_preparacion", "listo"] as const;

// Tolerancia de centavos al comparar el monto cobrado con el del pedido.
const AMOUNT_EPSILON = 0.005;

/**
 * Procesa las notificaciones de pago. Corre sin sesión de usuario, por eso recibe un
 * cliente con service role. Publica un evento cuando un pedido pasa a pagado.
 */
export class PaymentProcessor {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly db: Db,
    private readonly events: OrderEventBus,
  ) {}

  async handle(notification: PaymentNotification): Promise<ProcessResult> {
    if (notification.type !== "payment") return { status: "ignored" };
    if (!notification.dataId) throw new ServiceError("bad_request", "Falta el id del pago");

    const authentic = this.gateway.verifyWebhook({
      dataId: notification.dataId,
      signature: notification.signature,
      requestId: notification.requestId,
    });
    if (!authentic) throw new ServiceError("unauthorized", "Firma inválida");

    const payment = await this.gateway.getPayment(notification.dataId);
    if (!payment.orderId) throw new ServiceError("bad_request", "El pago no referencia un pedido");

    const { data: order } = await this.db
      .from("pedidos")
      .select("id, monto_total")
      .eq("id", payment.orderId)
      .maybeSingle();
    if (!order) throw new ServiceError("not_found", "Pedido inexistente");

    let rowState = ROW_STATE[payment.outcome];
    // Un pago aprobado por menos de lo que vale el pedido no lo confirma.
    if (rowState === "aprobado" && payment.amount + AMOUNT_EPSILON < Number(order.monto_total)) {
      console.error(`Monto insuficiente en el pago ${payment.id} del pedido ${order.id}`);
      rowState = "fallido";
    }

    const { error: paymentError } = await this.db
      .from("pagos")
      .update({ estado: rowState, transaccion_id: payment.id })
      .eq("pedido_id", order.id);
    if (paymentError) throw new Error(`No se pudo actualizar el pago: ${paymentError.message}`);

    let paid = false;
    if (rowState === "aprobado") {
      // Transición atómica: solo un webhook (MercadoPago reintenta y duplica) pasa de
      // pendiente_pago a pagado y dispara el evento una única vez. Un pedido que el comprador canceló sin
      // pagar también pasa a pagado si el dinero igual se acreditó (pagó desde un enlace ya abierto): el
      // estado del pago se lee del proveedor, así que un pedido reembolsado nunca llega acá.
      const { data: transitioned, error } = await this.db
        .from("pedidos")
        .update({ estado: "pagado" })
        .eq("id", order.id)
        .in("estado", ["pendiente_pago", "cancelado"])
        .select("id");
      if (error) throw new Error(`No se pudo confirmar el pedido: ${error.message}`);

      paid = (transitioned?.length ?? 0) > 0;
      if (paid) await this.events.emit("paid", { orderId: order.id });
    }

    // Reembolso o contracargo: si el pedido no salió, se cancela para que el vendedor no lo prepare gratis.
    // Si ya iba en camino o se entregó, no se toca: queda registrado para que lo resuelva una persona.
    let cancelled = false;
    if (rowState === "reembolsado") {
      const { data: stopped, error } = await this.db
        .from("pedidos")
        .update({ estado: "cancelado" })
        .eq("id", order.id)
        .in("estado", [...NOT_YET_SHIPPED])
        .select("id");
      if (error) throw new Error(`No se pudo cancelar el pedido reembolsado: ${error.message}`);
      cancelled = (stopped?.length ?? 0) > 0;
      if (!cancelled) console.error(`Pago ${payment.id} reembolsado con el pedido ${order.id} ya despachado o cerrado`);
    }

    return { status: "processed", orderId: order.id, paid, cancelled };
  }
}
