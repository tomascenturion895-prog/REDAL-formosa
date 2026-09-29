import { createBrowserClient } from "@supabase/ssr";

import type { Db } from "@/lib/supabase/types";

export type { Db };

// createBrowserClient devuelve una única instancia por pestaña, así que llamar a
// createClient() en cada repositorio no abre conexiones adicionales.
export function createClient(): Db {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // OJO: no cambiar el nombre de la cookie. El servidor (proxy, rutas API, callback de OAuth) lee la
      // sesión y el verificador PKCE con el nombre por defecto de @supabase/ssr; con otro nombre no ven
      // la sesión ("Tenés que iniciar sesión" estando logueado) y el ingreso con Google falla.
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        // Solo en https: en http://localhost (desarrollo, Docker) una cookie Secure no se guardaría.
        secure: typeof window !== "undefined" && window.location.protocol === "https:",
      },
    },
  ) as Db;
}
