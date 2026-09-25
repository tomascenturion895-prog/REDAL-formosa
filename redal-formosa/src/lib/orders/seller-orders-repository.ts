import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap } from "@/lib/supabase/repository";
import type { SellerOrder, SellerOrderItem } from "@/lib/domain/seller-orders";
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
    }));
  }

  /** Solo pagado → en preparación → listo; la base rechaza cualquier otro cambio. */
  async advance(orderId: string, estado: OrderStatus): Promise<void> {
    const { error } = await this.db.rpc("productor_avanzar_pedido", { p_pedido_id: orderId, p_estado: estado });
    if (error) throw new RepositoryError(`actualizar pedido: ${error.message}`, error);
  }
}

export const sellerOrdersRepository = new SellerOrdersRepository();
