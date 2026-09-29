import { NextResponse } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { ServiceError } from "./errors";
import { clientIp, enforceRateLimit, handleRoute } from "./http";
import { InMemoryRateLimiter } from "./security/rate-limiter";

describe("enforceRateLimit", () => {
  it("lanza 429 con el tiempo de espera cuando se supera el límite", () => {
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 60_000 });
    enforceRateLimit(limiter, "user-1");

    let error: unknown;
    try {
      enforceRateLimit(limiter, "user-1");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(ServiceError);
    expect(error).toMatchObject({ code: "rate_limited", status: 429 });
    expect((error as ServiceError).retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("handleRoute", () => {
  it("responde 429 con Retry-After", async () => {
    const response = await handleRoute(async () => {
      throw new ServiceError("rate_limited", "Demasiados intentos", 42);
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    expect(await response.json()).toEqual({ error: "Demasiados intentos" });
  });

  it("traduce los ServiceError a su estado HTTP", async () => {
    const response = await handleRoute(async () => {
      throw new ServiceError("not_found", "No existe");
    });
    expect(response.status).toBe(404);
  });

  it("no filtra el detalle de errores inesperados", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await handleRoute(async () => {
      throw new Error("password de la base: 1234");
    });
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("1234");
  });

  it("deja pasar la respuesta normal", async () => {
    const response = await handleRoute(async () => NextResponse.json({ ok: true }));
    expect(response.status).toBe(200);
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

  it("prefiere x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "1.1.1.1", "x-forwarded-for": "9.9.9.9, 2.2.2.2" }))).toBe("1.1.1.1");
  });

  it("toma el último valor de x-forwarded-for, no el que el cliente pudo inventar", () => {
    expect(clientIp(req({ "x-forwarded-for": "6.6.6.6, 2.2.2.2" }))).toBe("2.2.2.2");
  });

  it("devuelve un valor por defecto sin encabezados", () => {
    expect(clientIp(req({}))).toBe("desconocida");
  });
});
