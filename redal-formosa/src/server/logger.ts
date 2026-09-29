/**
 * Registro estructurado: una línea JSON por evento, fácil de filtrar en los logs del hosting.
 * El destino sigue siendo console.error, así los tests pueden silenciarlo.
 */
function describe(detail: unknown): unknown {
  if (detail instanceof Error) return { name: detail.name, message: detail.message, stack: detail.stack };
  return detail;
}

export function logError(message: string, detail?: unknown): void {
  console.error(JSON.stringify({ level: "error", time: new Date().toISOString(), message, detail: describe(detail) }));
}

export function logWarn(message: string): void {
  console.warn(JSON.stringify({ level: "warn", time: new Date().toISOString(), message }));
}
