import { createBrowserClient } from "@supabase/ssr";

import type { Db } from "@/lib/supabase/types";

export type { Db };

// createBrowserClient devuelve una única instancia por pestaña, así que llamar a
// createClient() en cada repositorio no abre conexiones adicionales.
export function createClient(): Db {
  const isLocal = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1") ?? false;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        name: "sb-auth-token",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: !isLocal,
      },
    },
  ) as Db;
}
