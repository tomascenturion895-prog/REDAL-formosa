"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { adminRepository } from "@/lib/admin/admin-repository";
import { useAuth } from "@/lib/auth/auth-context";
import { useAsync } from "@/lib/hooks/use-async";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldIcon } from "@/components/ui/icons";

const links = [
  { href: "/admin", label: "Resumen", badge: null },
  { href: "/admin/productos", label: "Moderar productos", badge: "productos_pendientes" },
  { href: "/admin/verificaciones", label: "Verificaciones", badge: "verificaciones_pendientes" },
  { href: "/admin/usuarios", label: "Usuarios", badge: null },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();
  // Los contadores de las pestañas muestran cuánto espera revisión.
  const { data: summary } = useAsync(() => adminRepository.summary(), [user?.id], {
    enabled: role === "admin",
    scope: user?.id,
  });

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
          {links.map(({ href, label, badge }) => {
            const count = badge && summary ? summary[badge] : 0;
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
                {count > 0 && (
                  <span className="ml-2 rounded-full bg-highlight px-2 py-0.5 text-xs font-bold text-on-highlight" aria-label={`${count} pendientes`}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
