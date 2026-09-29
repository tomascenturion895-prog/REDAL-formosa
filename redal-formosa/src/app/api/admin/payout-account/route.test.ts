import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: { id: "admin1" } as { id: string } | null,
  isAdmin: true,
  store: { owner_id: "owner1" } as { owner_id: string } | null,
  account: { cbu: "0170001512345678901233", banco: "galicia", titular: "Ana" } as unknown,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    rpc: async () => ({ data: state.isAdmin }),
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: state.store }) }) }) }),
  }),
}));
vi.mock("@/server/container", () => ({
  getBankAccountService: () => ({ load: async () => state.account }),
  limiters: { bankAccount: { check: () => ({ allowed: true }) } },
}));

import { GET } from "./route";

const call = (query = "?emprendimientoId=e1") => GET({ nextUrl: new URL(`http://x/api/admin/payout-account${query}`) } as never);

describe("GET /api/admin/payout-account", () => {
  beforeEach(() => {
    state.user = { id: "admin1" };
    state.isAdmin = true;
    state.store = { owner_id: "owner1" };
    state.account = { cbu: "0170001512345678901233", banco: "galicia", titular: "Ana" };
  });

  it("401 sin sesión", async () => {
    state.user = null;
    expect((await call()).status).toBe(401);
  });

  it("403 si no es administrador", async () => {
    state.isAdmin = false;
    expect((await call()).status).toBe(403);
  });

  it("400 sin emprendimiento y 404 si no existe o no cargó cuenta", async () => {
    expect((await call("")).status).toBe(400);
    state.store = null;
    expect((await call()).status).toBe(404);
    state.store = { owner_id: "owner1" };
    state.account = null;
    expect((await call()).status).toBe(404);
  });

  it("devuelve la cuenta al administrador", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect((await res.json()).account.titular).toBe("Ana");
  });
});
