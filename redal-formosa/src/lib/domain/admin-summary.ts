/** Tablero del administrador. Reglas puras: sin I/O. */

export interface AdminSummary {
  productos_pendientes: number;
  verificaciones_pendientes: number;
  pedidos_sin_preparar: number;
  pedidos_7d: number;
  pedidos_7d_previos: number;
  ingresos_7d: number;
  ingresos_7d_previos: number;
  pedidos_30d: number;
  cancelados_30d: number;
  productores_activos: number;
  productores_con_pedidos_30d: number;
  calificacion_promedio: number | null;
  total_calificaciones: number;
}

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** La función SQL devuelve JSON: se normaliza una vez, con ceros donde falte un dato. */
export function parseSummary(raw: unknown): AdminSummary {
  const data = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    productos_pendientes: num(data.productos_pendientes),
    verificaciones_pendientes: num(data.verificaciones_pendientes),
    pedidos_sin_preparar: num(data.pedidos_sin_preparar),
    pedidos_7d: num(data.pedidos_7d),
    pedidos_7d_previos: num(data.pedidos_7d_previos),
    ingresos_7d: num(data.ingresos_7d),
    ingresos_7d_previos: num(data.ingresos_7d_previos),
    pedidos_30d: num(data.pedidos_30d),
    cancelados_30d: num(data.cancelados_30d),
    productores_activos: num(data.productores_activos),
    productores_con_pedidos_30d: num(data.productores_con_pedidos_30d),
    calificacion_promedio: data.calificacion_promedio === null || data.calificacion_promedio === undefined ? null : num(data.calificacion_promedio),
    total_calificaciones: num(data.total_calificaciones),
  };
}

export interface Trend {
  /** Variación porcentual redondeada; null si no hay base de comparación. */
  percent: number | null;
  direction: "up" | "down" | "flat";
}

/** Compara la semana actual con la anterior. Sin semana previa no se inventa un porcentaje. */
export function trend(current: number, previous: number): Trend {
  if (previous <= 0) return { percent: null, direction: current > 0 ? "up" : "flat" };
  const percent = Math.round(((current - previous) / previous) * 100);
  return { percent, direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat" };
}

/** Porcentaje de pedidos cancelados; null si todavía no hubo pedidos en el período. */
export function cancellationRate(cancelled: number, total: number): number | null {
  return total > 0 ? Math.round((cancelled / total) * 100) : null;
}

/** Porcentaje de productores activos que tuvieron ventas; null si no hay productores. */
export function activationRate(withOrders: number, active: number): number | null {
  return active > 0 ? Math.min(100, Math.round((withOrders / active) * 100)) : null;
}
