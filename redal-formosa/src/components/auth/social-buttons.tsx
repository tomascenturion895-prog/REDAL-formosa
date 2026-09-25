"use client";

import { useState } from "react";

import { useAuthActions } from "@/lib/auth/use-auth-actions";
import { authErrorMessage } from "@/lib/auth/messages";

type SocialProvider = "google" | "facebook" | "twitter";

const PROVIDERS: { id: SocialProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: "google",
    label: "Continuar con Google",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 10.9l4-3Z" />
        <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Continuar con Facebook",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="#1877F2"
          d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"
        />
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "Continuar con X",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
        <path d="M18.2 2.3h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9.1L.9 2.3h7l4.8 6.4 5.5-6.4Zm-1.2 18h1.9L6.9 4.2H4.9L17 20.3Z" />
      </svg>
    ),
  },
];

interface SocialButtonsProps {
  onError: (message: string) => void;
  next?: string;
}

/** Botones de acceso con redes (Google, Facebook, X). Cada proveedor debe estar habilitado en Supabase (Authentication → Providers). */
export function SocialButtons({ onError, next = "/" }: SocialButtonsProps) {
  const { signInWithProvider } = useAuthActions();
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const handleClick = async (provider: SocialProvider) => {
    setPending(provider);
    const { error } = await signInWithProvider(provider, next);
    if (error) {
      const isUnconfigured = /provider is not enabled|unsupported provider/i.test(error.message);
      const friendlyName =
        provider === "google" ? "Google" : provider === "facebook" ? "Facebook" : "X";

      onError(
        isUnconfigured
          ? `El inicio de sesión con ${friendlyName} debe habilitarse en el panel de Supabase (Authentication → Providers).`
          : authErrorMessage(error),
      );
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map(({ id, label, icon }) => {
        const isCurrent = pending === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            disabled={pending !== null}
            aria-busy={isCurrent}
            className="btn btn-secondary relative w-full !justify-center !py-3 font-medium transition hover:shadow-sm disabled:opacity-60"
          >
            <span className="absolute left-4 flex items-center" aria-hidden="true">
              {icon}
            </span>
            {isCurrent ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Conectando…</span>
              </span>
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
}
