import { NextRequest } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { GET } from "./route";

const mockExchangeCodeForSession = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn().mockImplementation((_url, _key, options) => {
    // Simular que el cliente llama a setAll si se requiere
    options?.cookies?.setAll?.([{ name: "sb-token", value: "xyz", options: {} }]);
    return {
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
      from: vi.fn().mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockResolvedValue({ error: null }),
        }),
      }),
    };
  }),
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirige a /login con error si no hay código de autorización", async () => {
    const req = new NextRequest("http://localhost:3000/auth/callback");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=missing_code");
  });

  it("redirige a /login si el proveedor devuelve un error (ej. access_denied)", async () => {
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?error=access_denied&error_description=User%20denied",
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=User%20denied");
  });

  it("redirige a la ruta solicitada ('next') cuando el intercambio es exitoso", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: {
        user: {
          id: "u123",
          user_metadata: { full_name: "Juan Perez", avatar_url: "https://example.com/avatar.jpg" },
        },
      },
      error: null,
    });

    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=valid-code&next=/productos",
    );
    const res = await GET(req);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("valid-code");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/productos");
  });

  it("redirige a /login con el mensaje de error si falla exchangeCodeForSession", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: null,
      error: new Error("Invalid grant"),
    });

    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=bad-code",
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=Invalid%20grant");
  });
});
