import { NextResponse, type NextRequest } from "next/server";

import { ServiceError } from "./errors";
import { PaymentsNotConfiguredError } from "./payments/payment-gateway";
import type { RateLimiter } from "./security/rate-limiter";

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
    console.error("Error no controlado en ruta:", error);
    return NextResponse.json({ error: "Ocurrió un error. Intentá de nuevo." }, { status: 500 });
  }
}

/** Origen de la petición. Detrás de un proxy inverso confiable, viene en x-forwarded-for. */
export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconocida";
}

/** Lanza ServiceError(429) si la clave superó el límite. */
export function enforceRateLimit(limiter: RateLimiter, key: string): void {
  const result = limiter.check(key);
  if (!result.allowed) {
    throw new ServiceError("rate_limited", "Hiciste demasiados intentos. Esperá un momento y probá de nuevo.", result.retryAfterSeconds);
  }
}
