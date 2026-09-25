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
      <div className="mb-8 flex flex-col gap-4 border-b border-border/50 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Panel de Administración</h1>

        <nav aria-label="Administración" className="flex w-full gap-2 overflow-x-auto lg:w-auto">
          {links.map(({ href, label }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? "bg-action text-on-action shadow-sm" 
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
