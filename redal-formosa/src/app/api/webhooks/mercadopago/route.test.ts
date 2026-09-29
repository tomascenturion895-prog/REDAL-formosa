import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceError } from "@/server/errors";

const { handle } = vi.hoisted(() => ({ handle: vi.fn() }));

vi.mock("@/server/container", async () => {
  const { InMemoryRateLimiter } = await import("@/server/security/rate-limiter");
  return {
    limiters: { webhook: new InMemoryRateLimiter({ limit: 2, windowMs: 60_000 }) },
    getPaymentProcessor: () => ({ handle }),
  };
});

import { POST } from "./route";

let ipCounter = 0;
const post = (body: unknown, headers: Record<string, string> = {}, ip = `10.1.0.${++ipCounter}`) =>
  new Request("http://localhost/api/webhooks/mercadopago", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "x-real-ip": ip, ...headers },
  }) as never;

describe("POST /api/webhooks/mercadopago", () => {
  beforeEach(() => {
    handle.mockReset().mockResolvedValue({ status: "processed", orderId: "o1", paid: true, cancelled: false });
  });

  it("pasa al procesador el tipo, el id del pago y la firma", async () => {
    const response = await POST(post({ type: "payment", data: { id: 123 } }, { "x-signature": "ts=1,v1=abc", "x-request-id": "req-1" }));

    expect(response.status).toBe(200);
    expect(handle).toHaveBeenCalledWith({ type: "payment", dataId: "123", signature: "ts=1,v1=abc", requestId: "req-1" });
  });

  it("tolera un cuerpo que no es JSON", async () => {
    await POST(post("no es json"));
    expect(handle).toHaveBeenCalledWith(expect.objectContaining({ type: undefined, dataId: undefined }));
  });

  it("responde 401 cuando la firma no es válida", async () => {
    handle.mockRejectedValue(new ServiceError("unauthorized", "Firma inválida"));
    expect((await POST(post({ type: "payment", data: { id: 1 } }))).status).toBe(401);
  });

  it("limita por IP", async () => {
    const ip = "10.9.9.9";
    await POST(post({}, {}, ip));
    await POST(post({}, {}, ip));
    expect((await POST(post({}, {}, ip))).status).toBe(429);
  });
});
