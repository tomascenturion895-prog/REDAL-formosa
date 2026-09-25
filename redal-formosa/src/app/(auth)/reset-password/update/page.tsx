"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-context";
import { useAuthActions } from "@/lib/auth/use-auth-actions";
import { authErrorMessage } from "@/lib/auth/messages";
import { PasswordInput } from "@/components/ui/password-input";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { updatePassword } = useAuthActions();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(authErrorMessage(err));
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  if (authLoading) return null;

  // El enlace del email inicia una sesión temporal; sin ella no hay nada que cambiar.
  if (!user) {
    return (
      <div className="card space-y-3 p-6 text-center shadow-card sm:p-8">
        <h1 className="text-title">El enlace venció</h1>
        <p className="text-muted">Pedí uno nuevo desde “Olvidé mi contraseña”.</p>
      </div>
    );
  }

  return (
    <div className="card p-6 shadow-card sm:p-8">
      <h1 className="text-title">Nueva contraseña</h1>

      {error && (
        <div role="alert" className="mb-4 mt-4 rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña nueva
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium">
            Repetí la contraseña
          </label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-3">
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
