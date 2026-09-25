"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldIcon } from "@/components/ui/icons";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Moderar productos" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();

  if (loading) return <div className="page-container py-section" aria-busy="true" />;

  // La interfaz solo oculta; cada función de la base vuelve a verificar que sea admin.
  if (role !== "admin") {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<ShieldIcon size={36} />}
          title="Esta sección es solo para administradores"
          action={
            <Link href={user ? "/" : "/login"} className="btn btn-primary">
              {user ? "Volver al inicio" : "Ingresar"}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <h1 className="text-title pb-6">Administración</h1>

      <nav aria-label="Administración" className="mb-8 flex gap-1 overflow-x-auto border-b border-border">
        {links.map(({ href, label }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? "border-action text-foreground" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
