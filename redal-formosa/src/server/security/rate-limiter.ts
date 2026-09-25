export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Segundos hasta que se libera cupo (solo tiene sentido si allowed es false). */
  retryAfterSeconds: number;
}

/** Puerto de limitación de frecuencia. Hoy en memoria; para varias instancias se cambia por Redis sin tocar las rutas. */
export interface RateLimiter {
  check(key: string): RateLimitResult;
}

interface Options {
  /** Pedidos permitidos por ventana. */
  limit: number;
  windowMs: number;
  /** Reloj inyectable para las pruebas. */
  now?: () => number;
  /** Tope de claves en memoria; al superarlo se purgan las vencidas. */
  maxKeys?: number;
}

/**
 * Ventana fija por clave. Es por instancia del servidor: con varias réplicas cada una cuenta
 * por separado, lo que sigue frenando abusos pero no es un límite global exacto.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly options: Options) {}

  check(key: string): RateLimitResult {
    const { limit, windowMs, now = Date.now, maxKeys = 10_000 } = this.options;
    const current = now();

    if (this.windows.size >= maxKeys) this.purge(current);

    let window = this.windows.get(key);
    if (!window || window.resetAt <= current) {
      window = { count: 0, resetAt: current + windowMs };
      this.windows.set(key, window);
    }

    window.count += 1;
    const allowed = window.count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - window.count),
      retryAfterSeconds: allowed ? 0 : Math.ceil((window.resetAt - current) / 1000),
    };
  }

  private purge(current: number) {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= current) this.windows.delete(key);
    }
  }
}
