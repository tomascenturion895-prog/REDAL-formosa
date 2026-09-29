"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuthActions } from "@/lib/auth/use-auth-actions";
import { authErrorMessage, safeNextPath } from "@/lib/auth/messages";
import { PasswordInput } from "@/components/ui/password-input";
import { SocialButtons } from "@/components/auth/social-buttons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const urlError = searchParams.get("error");
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError ? authErrorMessage(urlError) : null,
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(authErrorMessage(err));
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="card p-6 shadow-card sm:p-8">
      <h1 className="text-title">Ingresar</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="font-medium text-link hover:underline">
          Creá una
        </Link>
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="field"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Link href="/reset-password" className="text-sm font-medium text-link hover:underline">
              Olvidé mi contraseña
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-3">
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        o ingresá con
        <span className="h-px flex-1 bg-border" />
      </div>

      <SocialButtons onError={(msg) => setError(msg)} next={next} />

      <div className="mt-6 rounded-card border border-border/80 bg-surface-muted/40 p-4">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted text-center sm:text-left">
          Acceso rápido para pruebas
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@seed.redal.test");
              setPassword("Redal-Demo-2026");
            }}
            className="rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium hover:border-action hover:bg-surface-muted text-center transition-colors"
          >
            🛡️ Admin Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("productor.chacraelsol@seed.redal.test");
              setPassword("Redal-Demo-2026");
            }}
            className="rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium hover:border-action hover:bg-surface-muted text-center transition-colors"
          >
            🌾 Vendedor Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("cliente.lucia@seed.redal.test");
              setPassword("Redal-Demo-2026");
            }}
            className="rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium hover:border-action hover:bg-surface-muted text-center transition-colors"
          >
            🛒 Comprador Demo
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tenés cuenta todavía?{" "}
        <Link
          href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-link hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
