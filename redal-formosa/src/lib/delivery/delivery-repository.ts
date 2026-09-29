import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap, unwrapOptional } from "@/lib/supabase/repository";
import { DELIVERY_ACTIVE_STATUSES } from "@/lib/domain/order-status";
import { parsePinResult, type PinResult } from "@/lib/domain/delivery-pin";
import type { LatLng } from "@/lib/domain/geo";
import { extractBuyerPhone, stripBuyerPhone } from "@/lib/domain/seller-orders";
import type { OrderStatus } from "@/lib/supabase/types";

export interface AssignedOrder {
  id: string;
  numero_pedido: string;
  estado: OrderStatus;
  direccion_entrega: string | null;
  /** Destino exacto si el comprador compartió su ubicación. */
  entrega: LatLng | null;
  /** Teléfono que el comprador dejó al pedir, para coordinar la entrega. */
  telefono_comprador: string | null;
  /** Indicaciones del comprador (timbre, horario…), sin el teléfono. */
  nota: string | null;
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
        .select("id, numero_pedido, estado, direccion_entrega, entrega_lat, entrega_lng, nota_cliente")
        .eq("repartidor_id", repartidorId)
        .in("estado", [...DELIVERY_ACTIVE_STATUSES]),
      "listar pedidos asignados",
    );
    return rows.map(({ entrega_lat, entrega_lng, nota_cliente, ...order }) => ({
      ...order,
      entrega: entrega_lat !== null && entrega_lng !== null ? { lat: entrega_lat, lng: entrega_lng } : null,
      telefono_comprador: extractBuyerPhone(nota_cliente),
      nota: stripBuyerPhone(nota_cliente) || null,
    }));
  }

  /** El repartidor marca que salió (listo → en camino) o que entregó (en camino → entregado, con el código del comprador). */
  async advance(orderId: string, estado: OrderStatus, pin?: string): Promise<PinResult> {
    const { data, error } = await this.db.rpc("repartidor_avanzar_pedido", { p_pedido_id: orderId, p_estado: estado, p_pin: pin });
    if (error) throw new RepositoryError(`actualizar entrega: ${error.message}`, error);
    return parsePinResult(data);
  }
}

export const deliveryRepository = new DeliveryRepository();
