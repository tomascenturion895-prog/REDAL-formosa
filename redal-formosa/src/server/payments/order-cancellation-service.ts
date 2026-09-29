import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "@/server/errors";
import type { PaymentGateway } from "./payment-gateway";
import { isCash } from "@/lib/domain/payment-methods";
import { logError } from "@/server/logger";

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
      .select("id, estado, metodo_pago, emprendimiento:emprendimientos!inner(owner_id)")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.emprendimiento?.owner_id !== sellerId) throw new ServiceError("not_found", "Pedido no encontrado");

    if (order.estado === "cancelado") return; // ya estaba cancelado: repetir no cambia nada
    if (!(CANCELLABLE as readonly string[]).includes(order.estado)) {
      throw new ServiceError("conflict", "Este pedido ya salió o todavía no se pagó: no se puede cancelar desde acá.");
    }

    // En efectivo no se cobró nada online: cancelar es solo cerrar el pedido, sin reembolso.
    if (isCash(order.metodo_pago as never)) {
      const { data: closed, error: cashError } = await this.adminDb
        .from("pedidos")
        .update({ estado: "cancelado" })
        .eq("id", order.id)
        .in("estado", [...CANCELLABLE])
        .select("id");
      if (cashError || !closed?.length) throw new ServiceError("conflict", "El pedido cambió de estado y ya no se puede cancelar desde acá.");
      await this.adminDb.from("pagos").update({ estado: "fallido" }).eq("pedido_id", order.id).eq("estado", "pendiente");
      return;
    }

    const { data: payment } = await this.adminDb
      .from("pagos")
      .select("estado, transaccion_id")
      .eq("pedido_id", order.id)
      .maybeSingle();
    // Un pago ya reembolsado con el pedido sin cerrar es un cierre que quedó a medias: se completa sin devolver otra vez.
    const alreadyRefunded = payment?.estado === "reembolsado";
    if (!payment?.transaccion_id || (payment.estado !== "aprobado" && !alreadyRefunded)) {
      throw new ServiceError("conflict", "No encontramos un pago aprobado para reembolsar. Escribinos para resolverlo.");
    }

    // Primero el dinero: si la devolución falla, el pedido sigue igual y se puede reintentar.
    // Si ya estaba reembolsado en el proveedor, MercadoPago rechaza el pedido; se consulta antes.
    const info = await this.gateway.getPayment(payment.transaccion_id);
    if (!alreadyRefunded && info.outcome === "approved") {
      // Última mirada al pedido justo antes de devolver el dinero: si salió mientras tanto, no se reembolsa.
      const { data: latest } = await this.adminDb.from("pedidos").select("estado").eq("id", order.id).maybeSingle();
      if (!latest || !(CANCELLABLE as readonly string[]).includes(latest.estado)) {
        throw new ServiceError("conflict", "El pedido cambió de estado y ya no se puede cancelar desde acá.");
      }
      try {
        await this.gateway.refund(payment.transaccion_id);
      } catch (error) {
        logError(`No se pudo reembolsar el pago ${payment.transaccion_id}`, error);
        throw new ServiceError("unavailable", "No pudimos devolver el dinero ahora. El pedido sigue igual: probá de nuevo en unos minutos.");
      }
    } else if (!alreadyRefunded && info.outcome !== "refunded") {
      throw new ServiceError("conflict", "El pago no está aprobado en Mercado Pago: no hay nada que reembolsar.");
    }

    const { error: paymentError } = await this.adminDb.from("pagos").update({ estado: "reembolsado" }).eq("pedido_id", order.id);
    if (paymentError) logError(`Reembolsado ${payment.transaccion_id} pero no se pudo marcar el pago`, paymentError.message);

    const { data: cancelled, error } = await this.adminDb
      .from("pedidos")
      .update({ estado: "cancelado" })
      .eq("id", order.id)
      // Si en el medio salió a reparto, también se cierra: el dinero ya volvió y no debe entregarse.
      .in("estado", [...CANCELLABLE, "en_camino"])
      .select("id");
    if (error || !cancelled?.length) {
      logError(`ALERTA: reembolsado ${payment.transaccion_id} pero el pedido ${order.id} no quedó cancelado`, error?.message);
      throw new ServiceError("conflict", "Devolvimos el dinero, pero el pedido cambió de estado a la vez. Revisalo y avisanos si algo no cuadra.");
    }
  }
}
