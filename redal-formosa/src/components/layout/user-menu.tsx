"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-context";
import { useAuthActions } from "@/lib/auth/use-auth-actions";
import { ChevronDownIcon } from "@/components/ui/icons";

const itemClass =
  "block w-full rounded-control px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted";

export function UserMenu() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) return <div className="h-10 w-24" aria-hidden="true" />;

  if (!user) {
    return (
      <>
        <Link href="/login" className="btn btn-primary sm:hidden">
          Ingresar
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          <Link href="/login" className="btn btn-ghost">
            Ingresar
          </Link>
          <Link href="/register" className="btn btn-primary">
            Crear cuenta
          </Link>
        </div>
      </>
    );
  }

  const name = (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "Mi cuenta";
  const initial = name.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="btn btn-ghost !gap-2 !px-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-action text-sm font-bold text-on-action">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{name}</span>
        <ChevronDownIcon size={16} className="text-muted" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-card border border-border bg-surface p-1.5 shadow-pop"
        >
          <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
          <Link role="menuitem" href="/mis-pedidos" className={itemClass} onClick={() => setOpen(false)}>
            Mis pedidos
          </Link>
          <Link role="menuitem" href="/favoritos" className={itemClass} onClick={() => setOpen(false)}>
            Favoritos
          </Link>
          <Link role="menuitem" href="/configuracion/notificaciones" className={itemClass} onClick={() => setOpen(false)}>
            Notificaciones
          </Link>
          <Link role="menuitem" href="/dashboard" className={itemClass} onClick={() => setOpen(false)}>
            Mi emprendimiento
          </Link>
          {role === "admin" && (
            <Link role="menuitem" href="/admin" className={itemClass} onClick={() => setOpen(false)}>
              Panel de administración
            </Link>
          )}
          <div className="my-1 border-t border-border" />
          <button role="menuitem" type="button" onClick={handleSignOut} className={itemClass}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
