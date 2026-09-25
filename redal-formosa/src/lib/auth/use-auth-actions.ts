import type { Provider } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export function useAuthActions() {
  const supabase = createClient();

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithProvider = async (
    provider: Extract<Provider, "google" | "facebook" | "twitter" | "x">,
    next: string = "/",
  ) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = new URL("/auth/callback", origin);
    if (next && next !== "/") {
      callbackUrl.searchParams.set("next", next);
    }

    const checkAndRedirect = async (targetProvider: Provider) => {
      const res = await supabase.auth.signInWithOAuth({
        provider: targetProvider,
        options: {
          redirectTo: callbackUrl.toString(),
          skipBrowserRedirect: true,
        },
      });

      if (res.error) return res;

      if (res.data?.url) {
        // Pre-flight para verificar si el proveedor está habilitado en el panel de Supabase
        // antes de navegar, evitando que el usuario quede en la pantalla JSON con error 400.
        try {
          const probe = await fetch(res.data.url, { redirect: "manual" });
          if (probe.status >= 400) {
            const body = await probe.json().catch(() => null);
            const message =
              body?.msg || body?.message || "Unsupported provider: provider is not enabled";
            return { data: res.data, error: new Error(message) };
          }
        } catch {
          // Si el fetch falla por CORS o red, procedemos con la navegación normal
        }

        if (typeof window !== "undefined") {
          window.location.assign(res.data.url);
        }
      }

      return res;
    };

    let result = await checkAndRedirect(provider as Provider);

    // En Supabase el proveedor de X puede estar registrado como 'twitter' (OAuth 1.0a) o 'x' (OAuth 2.0).
    // Si el primero no está habilitado, intentamos automáticamente con el alternativo.
    if (
      result.error &&
      (provider === "x" || provider === "twitter") &&
      /provider is not enabled|unsupported provider/i.test(result.error.message)
    ) {
      const fallbackProvider: Provider = provider === "x" ? "twitter" : "x";
      const fallbackResult = await checkAndRedirect(fallbackProvider);
      if (!fallbackResult.error) {
        return fallbackResult;
      }
    }

    return result;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/update`,
    });
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  };

  return {
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
  };
}
