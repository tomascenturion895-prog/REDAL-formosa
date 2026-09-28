import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap } from "@/lib/supabase/repository";
import type { CourierOption, SellerOrder, SellerOrderItem } from "@/lib/domain/seller-orders";
import type { OrderStatus } from "@/lib/supabase/types";

function toItems(raw: unknown): SellerOrderItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { nombre, unidad, cantidad, subtotal } = entry as Record<string, unknown>;
    return typeof nombre === "string" && typeof cantidad === "number"
      ? [{ nombre, unidad: typeof unidad === "string" ? unidad : "unidad", cantidad, subtotal: Number(subtotal ?? 0) }]
      : [];
  });
}

/** Pedidos pagados de los emprendimientos de la persona con sesión. La base decide qué se ve. */
export class SellerOrdersRepository {
  constructor(private readonly db: Db = createClient()) {}

  async list(): Promise<SellerOrder[]> {
    const rows = await unwrap(this.db.rpc("productor_pedidos"), "cargar pedidos");
    return rows.map((r) => ({
      ...r,
      monto_total: Number(r.monto_total),
      monto_envio: Number(r.monto_envio ?? 0),
      items: toItems(r.items),
      repartidor_id: r.repartidor_id ?? null,
      repartidor_nombre: r.repartidor_nombre ?? null,
    }));
  }

  /** Repartidores activos entre los que se puede elegir. */
  async couriers(): Promise<CourierOption[]> {
    return await unwrap(this.db.rpc("productor_repartidores"), "listar repartidores");
  }

  /** Asigna (o con null, quita) el repartidor de un pedido que todavía no salió. */
  async assignCourier(orderId: string, courierId: string | null): Promise<void> {
    const { error } = await this.db.rpc("productor_asignar_repartidor", {
      p_pedido_id: orderId,
      p_repartidor_id: courierId as string,
    });
    if (error) throw new RepositoryError(`asignar repartidor: ${error.message}`, error);
  }

  /** Solo el ciclo pagado → en preparación → listo → en camino → entregado; la base rechaza cualquier otro cambio. */
  async advance(orderId: string, estado: OrderStatus): Promise<void> {
    const { error } = await this.db.rpc("productor_avanzar_pedido", { p_pedido_id: orderId, p_estado: estado });
    if (error) throw new RepositoryError(`actualizar pedido: ${error.message}`, error);
  }

  /**
   * Cancela un pedido pago que todavía no salió y devuelve el dinero al comprador.
   * Pasa por el servidor porque el reembolso se pide al proveedor de pagos.
   */
  async cancelAndRefund(orderId: string): Promise<void> {
    const response = await fetch("/api/producer/cancel-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId: orderId }),
    });
    if (!response.ok) {
      const { error } = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(error ?? "No pudimos cancelar el pedido. Intentá de nuevo.");
    }
  }
}

export const sellerOrdersRepository = new SellerOrdersRepository();
