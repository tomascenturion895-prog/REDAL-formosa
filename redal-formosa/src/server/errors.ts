export type ServiceErrorCode = "unauthorized" | "not_found" | "conflict" | "bad_request" | "unavailable" | "rate_limited";

const STATUS: Record<ServiceErrorCode, number> = {
  unauthorized: 401,
  not_found: 404,
  conflict: 409,
  bad_request: 400,
  unavailable: 503,
  rate_limited: 429,
};

/** Error esperable de negocio: el mensaje es apto para mostrárselo a la persona. */
export class ServiceError extends Error {
  constructor(
    readonly code: ServiceErrorCode,
    message: string,
    /** Solo para rate_limited: segundos hasta poder reintentar (cabecera Retry-After). */
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ServiceError";
  }

  get status(): number {
    return STATUS[this.code];
  }
}
