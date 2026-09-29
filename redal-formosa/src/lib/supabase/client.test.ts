import { beforeEach, describe, expect, it, vi } from "vitest";

const createBrowserClient = vi.fn(() => ({}));
vi.mock("@supabase/ssr", () => ({ createBrowserClient }));

describe("createClient (navegador)", () => {
  beforeEach(() => {
    createBrowserClient.mockClear();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proyecto.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "clave");
  });

  it("usa el nombre de cookie por defecto: el servidor lee la sesión y el verificador PKCE con ese nombre", async () => {
    const { createClient } = await import("./client");
    createClient();
    const options = (createBrowserClient.mock.calls[0] as unknown as [string, string, { cookieOptions?: Record<string, unknown> }])[2];
    expect(options.cookieOptions).not.toHaveProperty("name");
  });
});
