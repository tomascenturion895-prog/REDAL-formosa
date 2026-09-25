import { createClient, type Db } from "@/lib/supabase/client";
import { unwrap, unwrapOptional } from "@/lib/supabase/repository";
import { DELIVERY_ACTIVE_STATUSES } from "@/lib/domain/order-status";
import type { LatLng } from "@/lib/domain/geo";
import type { OrderStatus } from "@/lib/supabase/types";

export interface AssignedOrder {
  id: string;
  numero_pedido: string;
  estado: OrderStatus;
  direccion_entrega: string | null;
  /** Destino exacto si el comprador compartió su ubicación. */
  entrega: LatLng | null;
}

export class DeliveryRepository {
  constructor(private readonly db: Db = createClient()) {}

  /** El repartidor asociado a una cuenta de usuario, o null si esa cuenta no es repartidor. */
  async findByUser(userId: string) {
    return await unwrapOptional(
      this.db.from("repartidores").select("id, tipo_vehiculo, activo").eq("user_id", userId).maybeSingle(),
      "cargar repartidor",
    );
  }

  async activeOrders(repartidorId: string): Promise<AssignedOrder[]> {
    const rows = await unwrap(
      this.db
        .from("pedidos")
        .select("id, numero_pedido, estado, direccion_entrega, entrega_lat, entrega_lng")
        .eq("repartidor_id", repartidorId)
        .in("estado", [...DELIVERY_ACTIVE_STATUSES]),
      "listar pedidos asignados",
    );
    return rows.map(({ entrega_lat, entrega_lng, ...order }) => ({
      ...order,
      entrega: entrega_lat !== null && entrega_lng !== null ? { lat: entrega_lat, lng: entrega_lng } : null,
    }));
  }
}

export const deliveryRepository = new DeliveryRepository();
