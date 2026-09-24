"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useAuthActions } from "@/lib/auth/use-auth-actions";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push("/");
      setOpen(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-control bg-action px-4 py-2 text-sm font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover"
      >
        Ingresar
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-control px-3 py-2 text-sm font-medium text-foreground transition-colors duration-150 ease-soft hover:bg-surface-muted"
      >
        {user.email?.split("@")[0]}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-card border border-border bg-surface shadow-pop">
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface-muted rounded-control"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
