import type { OrderStatus } from "@/lib/supabase/types";

export type { OrderStatus };

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  en_preparacion: "En preparación",
  listo: "Listo para entregar",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

// Clases de los tokens semánticos de globals.css.
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pendiente_pago: "bg-warning-soft text-warning",
  pagado: "bg-info-soft text-info",
  en_preparacion: "bg-info-soft text-info",
  listo: "bg-info-soft text-info",
  en_camino: "bg-success-soft text-success",
  entregado: "bg-success-soft text-success",
  cancelado: "bg-danger-soft text-danger",
};

/** Estados en los que el dinero ya entró: cuentan para ingresos y rankings. */
export const PAID_STATUSES: readonly OrderStatus[] = ["pagado", "en_preparacion", "listo", "en_camino", "entregado"];

/** Pedidos que un repartidor tiene que atender. */
export const DELIVERY_ACTIVE_STATUSES: readonly OrderStatus[] = ["listo", "en_camino"];

export const isPaid = (status: OrderStatus) => PAID_STATUSES.includes(status);
