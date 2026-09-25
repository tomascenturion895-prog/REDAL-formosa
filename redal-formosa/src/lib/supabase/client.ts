import { createBrowserClient } from "@supabase/ssr";

import type { Db } from "@/lib/supabase/types";

export type { Db };

// createBrowserClient devuelve una única instancia por pestaña, así que llamar a
// createClient() en cada repositorio no abre conexiones adicionales.
export function createClient(): Db {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  ) as Db;
}
