"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@/lib/auth/use-auth-actions";

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: err } = await signIn(email, password);
      if (err) throw err;
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h1 className="text-title mb-2">Ingresar</h1>
      <p className="mb-6 text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="font-medium text-link hover:underline">
          Registrate
        </Link>
      </p>

      {error && (
        <div className="mb-4 rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-control bg-action px-5 py-2.5 font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-muted">
        <Link href="/reset-password" className="font-medium text-link hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  );
}
