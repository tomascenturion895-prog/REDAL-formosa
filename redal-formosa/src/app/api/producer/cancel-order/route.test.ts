import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceError } from "@/server/errors";

const { getUser, cancelPaidOrder } = vi.hoisted(() => ({ getUser: vi.fn(), cancelPaidOrder: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser } }) }));
vi.mock("@/server/container", async () => {
  const { InMemoryRateLimiter } = await import("@/server/security/rate-limiter");
  return {
    limiters: { cancelOrder: new InMemoryRateLimiter({ limit: 50, windowMs: 60_000 }) },
    getOrderCancellationService: () => ({ cancelPaidOrder }),
  };
});

import { POST } from "./route";

const post = (body: unknown) =>
  new Request("http://localhost/api/producer/cancel-order", { method: "POST", body: JSON.stringify(body) }) as never;

describe("POST /api/producer/cancel-order", () => {
  beforeEach(() => {
    getUser.mockReset().mockResolvedValue({ data: { user: { id: "seller-1" } } });
    cancelPaidOrder.mockReset().mockResolvedValue(undefined);
  });

  it("exige sesión", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(post({ pedidoId: "o1" }))).status).toBe(401);
  });

  it("exige el pedido", async () => {
    expect((await POST(post({ pedidoId: 5 }))).status).toBe(400);
  });

  it("cancela con la identidad de la sesión y responde ok", async () => {
    const response = await POST(post({ pedidoId: "o1" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(cancelPaidOrder).toHaveBeenCalledWith(expect.anything(), "seller-1", "o1");
  });

  it("propaga los errores de negocio con su estado", async () => {
    cancelPaidOrder.mockRejectedValue(new ServiceError("forbidden", "No es tu pedido"));
    const response = await POST(post({ pedidoId: "o1" }));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "No es tu pedido" });
  });
});
