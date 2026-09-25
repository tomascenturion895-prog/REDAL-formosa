"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "./auth-context";

/**
 * Para pantallas que exigen sesión. Redirige a /login (volviendo luego a esta página) y
 * expone `pending` mientras se resuelve la sesión o se está redirigiendo.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  return { user, pending: loading || !user };
}
