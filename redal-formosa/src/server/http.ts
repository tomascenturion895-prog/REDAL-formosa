import { NextResponse } from "next/server";

import { ServiceError } from "./errors";
import { PaymentsNotConfiguredError } from "./payments/payment-gateway";
import type { RateLimiter } from "./security/rate-limiter";
import { logError } from "./logger";

/**
 * Envuelve un handler de ruta: los ServiceError esperables llegan como JSON con su estado;
 * cualquier otro error se registra y se devuelve como 500 sin filtrar detalles internos.
 */
export async function handleRoute(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ServiceError) {
      const headers = error.retryAfterSeconds ? { "Retry-After": String(error.retryAfterSeconds) } : undefined;
      return NextResponse.json({ error: error.message }, { status: error.status, headers });
    }
    if (error instanceof PaymentsNotConfiguredError) {
      return NextResponse.json(
        { error: "Los pagos todavía no están habilitados. Tu pedido quedó guardado como pendiente de pago." },
        { status: 503 },
      );
    }
    logError("Error no controlado en ruta", error);
    return NextResponse.json({ error: "Ocurrió un error. Intentá de nuevo." }, { status: 500 });
  }
}

/**
 * Origen de la petición. Los proxies agregan su observación al FINAL de x-forwarded-for; el primer
 * valor lo controla el cliente y permitiría eludir el límite con un encabezado inventado.
 */
export function clientIp(req: { headers: Headers }): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = req.headers.get("x-forwarded-for")?.split(",");
  return forwarded?.[forwarded.length - 1]?.trim() || "desconocida";
}

/** Lanza ServiceError(429) si la clave superó el límite. */
export function enforceRateLimit(limiter: RateLimiter, key: string): void {
  const result = limiter.check(key);
  if (!result.allowed) {
    throw new ServiceError("rate_limited", "Hiciste demasiados intentos. Esperá un momento y probá de nuevo.", result.retryAfterSeconds);
  }
}
