import { createClient } from "@/lib/supabase/client";

export interface OrderSummary {
  id: string;
  usuario_id: string;
  estado: string;
  total: number;
  creado_en: string;
  actualizado_en: string;
  cantidad_items: number;
  total_unidades: number;
  detalles_count: number;
}

export interface OrderDetail {
  detalle_id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre: string;
  producto_imagen?: string;
  producto_unidad: string;
  pedido_estado: string;
  usuario_id: string;
  pedido_total: number;
  pedido_fecha: string;
}

export interface OrderStats {
  usuario_id: string;
  total_pedidos: number;
  gasto_total: number;
  gasto_promedio: number;
  productos_diferentes: number;
  total_unidades: number;
  ultimo_pedido: string;
}

export class OrderHistoryService {
  private supabase = createClient();

  /**
   * Obtener todos los pedidos del usuario
   */
  async getOrders(userId: string, limit: number = 50): Promise<OrderSummary[]> {
    try {
      const { data, error } = await (this.supabase
        .from("usuario_pedidos")
        .select("*")
        .eq("usuario_id", userId)
        .order("creado_en", { ascending: false })
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  }

  /**
   * Obtener detalles completos de un pedido específico
   */
  async getOrderDetails(orderId: string, userId: string): Promise<OrderDetail[]> {
    try {
      const { data, error } = await (this.supabase
        .from("pedido_detalles_completos")
        .select("*")
        .eq("pedido_id", orderId)
        .eq("usuario_id", userId) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting order details:", error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de compras del usuario
   */
  async getStats(userId: string): Promise<OrderStats | null> {
    try {
      const { data, error } = await (this.supabase
        .from("usuario_compras_stats")
        .select("*")
        .eq("usuario_id", userId)
        .single() as any);

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error getting stats:", error);
      return null;
    }
  }

  /**
   * Obtener un pedido específico
   */
  async getOrder(orderId: string): Promise<OrderSummary | null> {
    try {
      const { data, error } = await (this.supabase
        .from("usuario_pedidos")
        .select("*")
        .eq("id", orderId)
        .single() as any);

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error getting order:", error);
      return null;
    }
  }

  /**
   * Obtener pedidos por estado
   */
  async getOrdersByStatus(userId: string, status: string): Promise<OrderSummary[]> {
    try {
      const { data, error } = await (this.supabase
        .from("usuario_pedidos")
        .select("*")
        .eq("usuario_id", userId)
        .eq("estado", status)
        .order("creado_en", { ascending: false }) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting orders by status:", error);
      return [];
    }
  }

  /**
   * Obtener pedidos recientes (últimos 7 días)
   */
  async getRecentOrders(userId: string): Promise<OrderSummary[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await (this.supabase
        .from("usuario_pedidos")
        .select("*")
        .eq("usuario_id", userId)
        .gte("creado_en", sevenDaysAgo.toISOString())
        .order("creado_en", { ascending: false }) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting recent orders:", error);
      return [];
    }
  }

  /**
   * Formatear estado con emoji
   */
  getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      pendiente: "⏳",
      confirmado: "✓",
      en_preparacion: "📦",
      en_trayecto: "🚚",
      entregado: "✓✓",
      cancelado: "✗",
    };
    return emojis[status] || "📋";
  }

  /**
   * Formatear estado en español
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendiente: "Pendiente",
      confirmado: "Confirmado",
      en_preparacion: "En preparación",
      en_trayecto: "En trayecto",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  }
}

export const orderHistoryService = new OrderHistoryService();
