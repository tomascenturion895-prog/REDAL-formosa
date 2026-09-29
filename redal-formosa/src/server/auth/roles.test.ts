import { describe, expect, it } from "vitest";

import type { Db } from "@/lib/supabase/types";
import { requireRole, resolveRole } from "./roles";

// Base mínima: perfil con rol, cantidad de emprendimientos y usuario de la sesión.
function fakeDb({ role, stores = 0, user = { id: "u1" } }: { role?: string; stores?: number; user?: { id: string } | null }): Db {
  const from = (table: string) => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      maybeSingle: () => Promise.resolve({ data: role ? { role } : null }),
      then: (resolve: (v: unknown) => unknown) => Promise.resolve({ count: table === "emprendimientos" ? stores : 0 }).then(resolve),
    };
    return builder;
  };
  return { from, auth: { getUser: async () => ({ data: { user } }) } } as unknown as Db;
}

describe("resolveRole", () => {
  it("admin gana sobre todo lo demás", async () => {
    expect(await resolveRole(fakeDb({ role: "admin", stores: 2 }), "u1")).toBe("ADMIN");
  });

  it("es vendedor con el rol emprendedor o con al menos un emprendimiento", async () => {
    expect(await resolveRole(fakeDb({ role: "emprendedor" }), "u1")).toBe("VENDEDOR");
    expect(await resolveRole(fakeDb({ role: "comprador", stores: 1 }), "u1")).toBe("VENDEDOR");
  });

  it("sin emprendimientos ni rol especial es comprador", async () => {
    expect(await resolveRole(fakeDb({ role: "comprador" }), "u1")).toBe("COMPRADOR");
    expect(await resolveRole(fakeDb({}), "u1")).toBe("COMPRADOR");
  });
});

describe("requireRole", () => {
  it("401 sin sesión", async () => {
    await expect(requireRole(fakeDb({ user: null }), ["VENDEDOR"])).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("403 si el rol no está permitido", async () => {
    await expect(requireRole(fakeDb({ role: "comprador" }), ["VENDEDOR", "ADMIN"])).rejects.toMatchObject({ code: "forbidden" });
  });

  it("devuelve la persona y su rol cuando corresponde", async () => {
    await expect(requireRole(fakeDb({ role: "admin" }), ["VENDEDOR", "ADMIN"])).resolves.toEqual({ userId: "u1", role: "ADMIN" });
  });
});
