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

    const targetProvider: Provider = provider as Provider;
    let { data, error } = await supabase.auth.signInWithOAuth({
      provider: targetProvider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    // En Supabase el proveedor de X puede estar registrado como 'twitter' (OAuth 1.0a) o 'x' (OAuth 2.0).
    // Si el primero no está habilitado, intentamos automáticamente con el alternativo.
    if (
      error &&
      (provider === "x" || provider === "twitter") &&
      /provider is not enabled|unsupported provider/i.test(error.message)
    ) {
      const fallbackProvider: Provider = provider === "x" ? "twitter" : "x";
      const fallbackResult = await supabase.auth.signInWithOAuth({
        provider: fallbackProvider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      if (!fallbackResult.error) {
        return { data: fallbackResult.data, error: null };
      }
    }

    return { data, error };
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
