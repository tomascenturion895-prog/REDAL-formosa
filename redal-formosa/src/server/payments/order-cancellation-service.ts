import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "@/server/errors";
import type { PaymentGateway } from "./payment-gateway";

/** Estados en los que el pedido está pago pero todavía no salió: el único momento en que se puede cancelar y devolver el dinero. */
const CANCELLABLE = ["pagado", "en_preparacion", "listo"] as const;

/**
 * El vendedor cancela un pedido ya pago (sin stock, no puede cumplirlo) y el comprador recibe
 * el reembolso completo. `sellerDb` lleva la sesión del vendedor y decide, con RLS, si el pedido
 * es suyo; `adminDb` (service role) hace lo que el vendedor no puede: leer el pago y cerrar el pedido.
 */
export class OrderCancellationService {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly adminDb: Db,
  ) {}

  async cancelPaidOrder(sellerDb: Db, sellerId: string, orderId: string): Promise<void> {
    // La política de lectura del vendedor limita esta consulta a pedidos de sus emprendimientos.
    const { data: order } = await sellerDb
      .from("pedidos")
      .select("id, estado, emprendimiento:emprendimientos!inner(owner_id)")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.emprendimiento?.owner_id !== sellerId) throw new ServiceError("not_found", "Pedido no encontrado");

    if (order.estado === "cancelado") return; // ya estaba cancelado: repetir no cambia nada
    if (!(CANCELLABLE as readonly string[]).includes(order.estado)) {
      throw new ServiceError("conflict", "Este pedido ya salió o todavía no se pagó: no se puede cancelar desde acá.");
    }

    const { data: payment } = await this.adminDb
      .from("pagos")
      .select("estado, transaccion_id")
      .eq("pedido_id", order.id)
      .maybeSingle();
    if (!payment?.transaccion_id || payment.estado !== "aprobado") {
      throw new ServiceError("conflict", "No encontramos un pago aprobado para reembolsar. Escribinos para resolverlo.");
    }

    // Primero el dinero: si la devolución falla, el pedido sigue igual y se puede reintentar.
    // Si ya estaba reembolsado en el proveedor, MercadoPago rechaza el pedido; se consulta antes.
    const info = await this.gateway.getPayment(payment.transaccion_id);
    if (info.outcome === "approved") {
      try {
        await this.gateway.refund(payment.transaccion_id);
      } catch (error) {
        console.error(`No se pudo reembolsar el pago ${payment.transaccion_id}`, error);
        throw new ServiceError("unavailable", "No pudimos devolver el dinero ahora. El pedido sigue igual: probá de nuevo en unos minutos.");
      }
    } else if (info.outcome !== "refunded") {
      throw new ServiceError("conflict", "El pago no está aprobado en Mercado Pago: no hay nada que reembolsar.");
    }

    const { error: paymentError } = await this.adminDb.from("pagos").update({ estado: "reembolsado" }).eq("pedido_id", order.id);
    if (paymentError) console.error(`Reembolsado ${payment.transaccion_id} pero no se pudo marcar el pago`, paymentError.message);

    const { data: cancelled, error } = await this.adminDb
      .from("pedidos")
      .update({ estado: "cancelado" })
      .eq("id", order.id)
      .in("estado", [...CANCELLABLE])
      .select("id");
    if (error || !cancelled?.length) {
      console.error(`Reembolsado ${payment.transaccion_id} pero el pedido ${order.id} no quedó cancelado`, error?.message);
      throw new ServiceError("conflict", "Devolvimos el dinero, pero el pedido cambió de estado a la vez. Revisalo y avisanos si algo no cuadra.");
    }
  }
}
