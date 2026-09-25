import type { OrderStatus } from "./order-status";

/** Pedido tal como lo ve el vendedor (ya pagado). Reglas puras: sin I/O. */
export interface SellerOrderItem {
  nombre: string;
  unidad: string;
  cantidad: number;
  subtotal: number;
}

export interface SellerOrder {
  id: string;
  numero_pedido: string;
  estado: OrderStatus;
  monto_total: number;
  monto_envio: number;
  direccion_entrega: string | null;
  nota_cliente: string | null;
  creado_en: string;
  comprador_nombre: string;
  emprendimiento_id: string;
  emprendimiento_nombre: string;
  items: SellerOrderItem[];
}

/** Lo único que el vendedor puede hacer con un pedido; el resto de las etapas las cubre el reparto. */
export const NEXT_STEP: Partial<Record<OrderStatus, { estado: OrderStatus; label: string }>> = {
  pagado: { estado: "en_preparacion", label: "Empezar a preparar" },
  en_preparacion: { estado: "listo", label: "Marcar como listo" },
};

export type OrderGroupKey = "por_preparar" | "en_preparacion" | "listos" | "cerrados";

export const ORDER_GROUPS: { key: OrderGroupKey; title: string; empty: string }[] = [
  { key: "por_preparar", title: "Por preparar", empty: "No hay pedidos nuevos." },
  { key: "en_preparacion", title: "En preparación", empty: "Nada en preparación." },
  { key: "listos", title: "Listos y en camino", empty: "Ningún pedido esperando entrega." },
  { key: "cerrados", title: "Cerrados", empty: "Todavía no cerraste pedidos." },
];

const GROUP_OF: Record<OrderStatus, OrderGroupKey | null> = {
  pendiente_pago: null,
  pagado: "por_preparar",
  en_preparacion: "en_preparacion",
  listo: "listos",
  en_camino: "listos",
  entregado: "cerrados",
  cancelado: "cerrados",
};

/** Agrupa por etapa de trabajo; dentro de cada grupo, los más viejos primero (los que esperan hace más). */
export function groupOrders(orders: readonly SellerOrder[]): Record<OrderGroupKey, SellerOrder[]> {
  const groups: Record<OrderGroupKey, SellerOrder[]> = { por_preparar: [], en_preparacion: [], listos: [], cerrados: [] };
  for (const order of orders) {
    const key = GROUP_OF[order.estado];
    if (key) groups[key].push(order);
  }
  for (const key of ["por_preparar", "en_preparacion", "listos"] as const) {
    groups[key].sort((a, b) => a.creado_en.localeCompare(b.creado_en));
  }
  groups.cerrados.sort((a, b) => b.creado_en.localeCompare(a.creado_en));
  return groups;
}

/** El teléfono que el comprador dejó al pagar viaja en la nota como "Tel: ..."; null si no está. */
export function extractBuyerPhone(note: string | null): string | null {
  const match = note?.match(/Tel:\s*([+\d][\d\s().-]{5,})/i);
  return match ? match[1].trim() : null;
}

/** Hace cuánto se hizo el pedido, en lenguaje corriente ("hace 3 h"). */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} ${days === 1 ? "día" : "días"}`;
}

/** Mensaje de WhatsApp al comprador según la etapa del pedido. */
export function buyerMessage(order: Pick<SellerOrder, "comprador_nombre" | "emprendimiento_nombre" | "numero_pedido" | "estado">): string {
  const first = order.comprador_nombre.split(" ")[0] || "";
  const hello = first ? `Hola ${first}` : "Hola";
  const state =
    order.estado === "listo"
      ? "ya está listo"
      : order.estado === "en_preparacion"
        ? "lo estamos preparando"
        : "lo recibimos";
  return `${hello}, te escribe ${order.emprendimiento_nombre} por tu pedido ${order.numero_pedido} de RedAL Formosa: ${state}.`;
}
