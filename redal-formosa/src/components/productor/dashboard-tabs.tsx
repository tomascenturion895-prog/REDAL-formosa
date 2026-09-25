"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-context";
import { groupOrders } from "@/lib/domain/seller-orders";
import { useAsync } from "@/lib/hooks/use-async";
import { sellerOrdersRepository } from "@/lib/orders/seller-orders-repository";

const REFRESH_MS = 30_000;

/** Pestañas del panel del vendedor; "Pedidos" muestra cuántos esperan preparación. */
export function DashboardTabs() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: orders, reload } = useAsync(() => sellerOrdersRepository.list(), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(reload, REFRESH_MS);
    return () => clearInterval(timer);
  }, [user, reload]);

  const waiting = orders ? groupOrders(orders).por_preparar.length : 0;
  const tabs = [
    { href: "/dashboard", label: "Hoy", badge: 0 },
    { href: "/dashboard/pedidos", label: "Pedidos", badge: waiting },
  ];

  return (
    <nav aria-label="Panel del vendedor" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border px-1">
      {tabs.map(({ href, label, badge }) => {
        const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              active ? "border-action text-foreground" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {label}
            {badge > 0 && (
              <span className="rounded-full bg-highlight px-2 py-0.5 text-xs font-bold text-on-highlight" aria-label={`${badge} pendientes`}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
