import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, createSession } = vi.hoisted(() => ({ getUser: vi.fn(), createSession: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser } }) }));
vi.mock("@/server/container", async () => {
  const { InMemoryRateLimiter } = await import("@/server/security/rate-limiter");
  return {
    limiters: { checkout: new InMemoryRateLimiter({ limit: 2, windowMs: 60_000 }) },
    getCheckoutService: () => ({ createSession }),
  };
});

import { POST } from "./route";

const post = (body: unknown) =>
  new Request("http://localhost/api/checkout/create-preference", { method: "POST", body: JSON.stringify(body) }) as never;

let userCounter = 0;

describe("POST /api/checkout/create-preference", () => {
  beforeEach(() => {
    getUser.mockReset().mockImplementation(async () => ({ data: { user: { id: `u${++userCounter}` } } }));
    createSession.mockReset().mockResolvedValue({ url: "https://mp.test/pay" });
  });

  it("exige sesión", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(post({ pedidoId: "o1" }));
    expect(response.status).toBe(401);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("exige el pedido a pagar", async () => {
    const response = await POST(post({}));
    expect(response.status).toBe(400);
  });

  it("devuelve la URL de pago del pedido de la persona autenticada", async () => {
    const response = await POST(post({ pedidoId: "o1" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://mp.test/pay" });
    expect(createSession).toHaveBeenCalledWith(expect.anything(), expect.stringMatching(/^u/), "o1");
  });

  it("limita los intentos por usuario", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "spammer" } } });
    await POST(post({ pedidoId: "o1" }));
    await POST(post({ pedidoId: "o1" }));
    const response = await POST(post({ pedidoId: "o1" }));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });
});
