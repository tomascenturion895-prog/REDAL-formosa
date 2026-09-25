"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuthActions } from "@/lib/auth/use-auth-actions";
import { authErrorMessage } from "@/lib/auth/messages";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuthActions();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await resetPassword(email.trim());
    if (err) setError(authErrorMessage(err));
    else setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="card space-y-4 p-6 text-center shadow-card sm:p-8">
        <h1 className="text-title">Revisá tu email</h1>
        <p className="text-muted">
          Si <strong className="text-foreground">{email}</strong> tiene una cuenta, te enviamos un enlace para elegir una
          contraseña nueva.
        </p>
        <Link href="/login" className="btn btn-secondary">
          Volver a ingresar
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6 shadow-card sm:p-8">
      <h1 className="text-title">Recuperar contraseña</h1>
      <p className="mb-6 mt-2 text-sm text-muted">Ingresá tu email y te mandamos un enlace para crear una nueva.</p>

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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full !py-3">
          {loading ? "Enviando…" : "Enviar enlace"}
        </button>
        <Link href="/login" className="block text-center text-sm font-medium text-link hover:underline">
          Volver a ingresar
        </Link>
      </form>
    </div>
  );
}
