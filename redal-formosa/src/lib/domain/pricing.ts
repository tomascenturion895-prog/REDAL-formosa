// Debe coincidir con la función SQL calcular_envio(): el servidor es quien manda,
// esto solo permite mostrar una estimación antes de crear el pedido.
const ENVIO_BASE = 100;
const ENVIO_POR_LINEA = 50;

export function estimarEnvio(cantidadLineas: number): number {
  return cantidadLineas > 0 ? ENVIO_BASE + ENVIO_POR_LINEA * cantidadLineas : 0;
}

export interface Priced {
  precio: number | string;
  cantidad: number;
}

export function subtotal(lines: readonly Priced[]): number {
  return lines.reduce((sum, l) => sum + Number(l.precio) * l.cantidad, 0);
}
