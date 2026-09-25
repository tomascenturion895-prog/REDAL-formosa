import { createClient } from "@supabase/supabase-js";

import type { Database, Db } from "@/lib/supabase/types";

// Solo para código de servidor que actúa sin sesión de usuario (webhooks).
// SUPABASE_SERVICE_ROLE_KEY nunca debe llevar el prefijo NEXT_PUBLIC_.
export function createAdminClient(): Db {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY para operar sin sesión de usuario");
  }
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
