"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuthActions } from "@/lib/auth/use-auth-actions";
import { authErrorMessage, safeNextPath } from "@/lib/auth/messages";
import { SocialButtons } from "@/components/auth/social-buttons";
import { CheckIcon } from "@/components/ui/icons";
import { PasswordInput } from "@/components/ui/password-input";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const { signUp } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    setError(null);
    setLoading(true);

    const { data, error: err } = await signUp(email.trim(), password, fullName.trim());
    if (err) {
      setError(authErrorMessage(err));
      setLoading(false);
      return;
    }

    // Supabase no da error si el email ya existe: devuelve un usuario sin identidades.
    if (data.user && data.user.identities?.length === 0) {
      setError(authErrorMessage("User already registered"));
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }
    setPendingConfirmation(true);
    setLoading(false);
  };

  if (pendingConfirmation) {
    return (
      <div className="card space-y-4 p-6 text-center shadow-card sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckIcon size={24} />
        </span>
        <h1 className="text-title">Revisá tu email</h1>
        <p className="text-muted">
          Te mandamos un enlace de confirmación a <strong className="text-foreground">{email}</strong>. Al abrirlo,
          tu cuenta queda activa.
        </p>
        <Link
          href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="btn btn-secondary"
        >
          Ir a ingresar
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6 shadow-card sm:p-8">
      <h1 className="text-title">Crear cuenta</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-link hover:underline"
        >
          Ingresá
        </Link>
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
            Nombre y apellido
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="field"
          />
        </div>

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
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            aria-describedby="password-hint"
            placeholder="Mínimo 6 caracteres"
          />
          <p id="password-hint" className="mt-1 text-xs text-muted">
            Mínimo 6 caracteres.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Confirmar contraseña
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
            required
            aria-invalid={mismatch}
            aria-describedby={mismatch ? "confirm-error" : undefined}
            className={mismatch ? "!border-danger" : ""}
            placeholder="Repetí tu contraseña"
          />
          {mismatch && (
            <p id="confirm-error" role="alert" className="mt-1 text-xs text-danger">
              Las contraseñas no coinciden.
            </p>
          )}
        </div>

        <button type="submit" disabled={loading || !confirm || mismatch} aria-busy={loading} className="btn btn-primary w-full !py-3">
          {loading ? "Creando tu cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        o registrate con
        <span className="h-px flex-1 bg-border" />
      </div>
      <SocialButtons onError={(message) => setError(message)} next={next} />
    </div>
  );
}
