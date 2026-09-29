import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

/**
 * Cliente anónimo para lecturas públicas en el servidor (metadatos, sitemap). No usa cookies ni
 * sesión: solo ve lo que la RLS publica para cualquiera, y no vuelve dinámica la página que lo llama.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
