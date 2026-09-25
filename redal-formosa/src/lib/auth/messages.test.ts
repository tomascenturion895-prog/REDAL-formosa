import { describe, expect, it } from "vitest";

import { authErrorMessage, safeNextPath } from "./messages";

describe("safeNextPath", () => {
  it("acepta rutas internas", () => {
    expect(safeNextPath("/mis-pedidos")).toBe("/mis-pedidos");
    expect(safeNextPath("/productos?q=miel")).toBe("/productos?q=miel");
  });

  it("evita redirecciones abiertas hacia otros sitios", () => {
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
  });

  it("usa la portada cuando no hay destino", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });
});

describe("authErrorMessage", () => {
  it("traduce los errores conocidos de Supabase", () => {
    expect(authErrorMessage(new Error("Invalid login credentials"))).toMatch(/no son correctos/);
    expect(authErrorMessage("User already registered")).toMatch(/ya tiene una cuenta/);
    expect(authErrorMessage(new Error("Email not confirmed"))).toMatch(/confirmaste/);
    expect(authErrorMessage("Provider is not enabled")).toMatch(/no está habilitado/);
    expect(authErrorMessage("access_denied")).toMatch(/Cancelaste/);
    expect(authErrorMessage("oauth_error")).toMatch(/No se pudo autenticar/);
    expect(authErrorMessage("missing_code")).toMatch(/código de autorización/);
  });

  it("no filtra mensajes internos desconocidos", () => {
    expect(authErrorMessage(new Error("pg: connection refused at 10.0.0.5"))).toBe("Algo salió mal. Intentá de nuevo.");
    expect(authErrorMessage(undefined)).toBe("Algo salió mal. Intentá de nuevo.");
  });
});
