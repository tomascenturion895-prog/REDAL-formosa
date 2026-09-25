import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap, unwrapOptional } from "@/lib/supabase/repository";
import type { LatLng } from "@/lib/domain/geo";
import type { Database, OrderStatus } from "@/lib/supabase/types";

type OrderViewRow = Database["public"]["Views"]["usuario_pedidos"]["Row"];
type OrderDetailRow = Database["public"]["Views"]["pedido_detalles_completos"]["Row"];

export interface OrderSummary {
  id: string;
  numero_pedido: string;
  emprendimiento_nombre: string;
  estado: OrderStatus;
  monto_total: number;
  monto_envio: number;
  created_at: string;
  total_unidades: number;
}

export interface OrderDetail {
  detalle_id: string;
  producto_id: string;
  producto_nombre: string;
  producto_imagen: string | null;
  producto_unidad: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface OrderStats {
  total_pedidos: number;
  gasto_total: number;
  gasto_promedio: number;
  productos_diferentes: number;
}

export interface OrderConfirmation {
  id: string;
  numero_pedido: string;
  estado: OrderStatus;
  monto_total: number;
  direccion_entrega: string | null;
  nota_cliente: string | null;
  repartidor_id: string | null;
  /** Destino de la entrega, si la persona compartió su ubicación al comprar. */
  entrega: LatLng | null;
}

export interface NewOrderInput {
  emprendimientoId: string;
  items: { producto_id: string; cantidad: number }[];
  direccion: string;
  nota?: string;
  /** Ubicación de entrega (opcional): permite mostrar el recorrido exacto en el mapa. */
  ubicacion?: LatLng;
}

export interface CreatedOrder {
  pedidoId: string;
  numero: string;
  monto: number;
}

// Las vistas devuelven todas las columnas como nullable; el mapeo las normaliza una sola vez.
const toSummary = (r: OrderViewRow): OrderSummary => ({
  id: r.id ?? "",
  numero_pedido: r.numero_pedido ?? "",
  emprendimiento_nombre: r.emprendimiento_nombre ?? "",
  estado: (r.estado ?? "pendiente_pago") as OrderStatus,
  monto_total: Number(r.monto_total ?? 0),
  monto_envio: Number(r.monto_envio ?? 0),
  created_at: r.created_at ?? "",
  total_unidades: Number(r.total_unidades ?? 0),
});

const toDetail = (r: OrderDetailRow): OrderDetail => ({
  detalle_id: r.detalle_id ?? "",
  producto_id: r.producto_id ?? "",
  producto_nombre: r.producto_nombre ?? "",
  producto_imagen: r.producto_imagen ?? null,
  producto_unidad: r.producto_unidad ?? "",
  cantidad: Number(r.cantidad ?? 0),
  precio_unitario: Number(r.precio_unitario ?? 0),
  subtotal: Number(r.subtotal ?? 0),
});

export class OrdersRepository {
  constructor(private readonly db: Db = createClient()) {}

  async list(userId: string, limit = 50): Promise<OrderSummary[]> {
    const rows = await unwrap(
      this.db
        .from("usuario_pedidos")
        .select("*")
        .eq("comprador_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit),
      "listar pedidos",
    );
    return rows.map(toSummary);
  }

  async get(orderId: string, userId: string): Promise<OrderSummary | null> {
    const row = await unwrapOptional(
      this.db.from("usuario_pedidos").select("*").eq("id", orderId).eq("comprador_id", userId).maybeSingle(),
      "cargar pedido",
    );
    return row ? toSummary(row) : null;
  }

  async details(orderId: string, userId: string): Promise<OrderDetail[]> {
    const rows = await unwrap(
      this.db.from("pedido_detalles_completos").select("*").eq("pedido_id", orderId).eq("comprador_id", userId),
      "cargar detalle del pedido",
    );
    return rows.map(toDetail);
  }

  async stats(userId: string): Promise<OrderStats | null> {
    const row = await unwrapOptional(
      this.db.from("usuario_compras_stats").select("*").eq("comprador_id", userId).maybeSingle(),
      "cargar estadísticas de compras",
    );
    return row
      ? {
          total_pedidos: Number(row.total_pedidos ?? 0),
          gasto_total: Number(row.gasto_total ?? 0),
          gasto_promedio: Number(row.gasto_promedio ?? 0),
          productos_diferentes: Number(row.productos_diferentes ?? 0),
        }
      : null;
  }

  /** Datos mínimos de un pedido propio (pantallas de confirmación y seguimiento). */
  async getConfirmation(orderId: string): Promise<OrderConfirmation | null> {
    const row = await unwrapOptional(
      this.db
        .from("pedidos")
        .select("id, numero_pedido, estado, monto_total, direccion_entrega, nota_cliente, repartidor_id, entrega_lat, entrega_lng")
        .eq("id", orderId)
        .maybeSingle(),
      "cargar confirmación del pedido",
    );
    if (!row) return null;
    const { entrega_lat, entrega_lng, ...rest } = row;
    return {
      ...rest,
      monto_total: Number(rest.monto_total),
      entrega: entrega_lat !== null && entrega_lng !== null ? { lat: entrega_lat, lng: entrega_lng } : null,
    };
  }

  /**
   * Crea el pedido en la base. El servidor valida disponibilidad y calcula precios y envío:
   * el cliente solo dice qué productos y cuántos.
   */
  async create(input: NewOrderInput): Promise<CreatedOrder> {
    const rows = await unwrap(
      this.db.rpc("crear_pedido", {
        p_emprendimiento_id: input.emprendimientoId,
        p_items: input.items,
        p_direccion: input.direccion,
        p_nota: input.nota,
        p_lat: input.ubicacion?.lat,
        p_lng: input.ubicacion?.lng,
      }),
      "crear pedido",
    );
    const created = rows[0];
    if (!created) throw new RepositoryError("crear pedido: la base no devolvió el pedido");
    return { pedidoId: created.out_pedido_id, numero: created.out_numero, monto: Number(created.out_monto) };
  }
}

export const ordersRepository = new OrdersRepository();
