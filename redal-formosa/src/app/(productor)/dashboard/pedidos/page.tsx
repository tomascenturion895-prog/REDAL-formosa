"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { groupOrders, NEXT_STEP, ORDER_GROUPS, type SellerOrder } from "@/lib/domain/seller-orders";
import { useAsync } from "@/lib/hooks/use-async";
import { sellerOrdersRepository } from "@/lib/orders/seller-orders-repository";
import { SellerOrderCard } from "@/components/productor/seller-order-card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const REFRESH_MS = 30_000;

export default function PedidosDelVendedorPage() {
  const { user, pending } = useRequireAuth();
  const { data: orders, error, loading, reload } = useAsync(() => sellerOrdersRepository.list(), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Los pedidos nuevos aparecen solos, sin que el vendedor tenga que recargar.
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(reload, REFRESH_MS);
    return () => clearInterval(timer);
  }, [user, reload]);

  const advance = async (order: SellerOrder) => {
    const step = NEXT_STEP[order.estado];
    if (!step) return;
    setBusyId(order.id);
    setActionError(null);
    try {
      await sellerOrdersRepository.advance(order.id, step.estado);
      reload();
    } catch {
      setActionError("No pudimos actualizar el pedido. Puede que ya haya cambiado: recargá la lista.");
    } finally {
      setBusyId(null);
    }
  };

  if (pending || (loading && !orders)) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    );
  }
  if (error) return <Alert tone="error">No pudimos cargar tus pedidos. Probá de nuevo en un momento.</Alert>;

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        illustration="basket"
        title="Todavía no recibiste pedidos"
        description="Cuando alguien te compre y pague, el pedido aparece acá con todo lo que tenés que preparar."
        action={
          <Link href="/dashboard" className="btn btn-primary">
            Cargar productos
          </Link>
        }
      />
    );
  }

  const groups = groupOrders(orders);
  const stores = new Set(orders.map((o) => o.emprendimiento_id));

  return (
    <div className="space-y-10">
      {actionError && <Alert tone="error">{actionError}</Alert>}

      {ORDER_GROUPS.map(({ key, title, empty }) => (
        <section key={key} aria-labelledby={`grupo-${key}`} className="space-y-4">
          <h2 id={`grupo-${key}`} className="flex items-center gap-2 text-heading">
            {title}
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-sm font-semibold text-muted">{groups[key].length}</span>
          </h2>
          {groups[key].length === 0 ? (
            <p className="rounded-card border border-dashed border-border px-4 py-6 text-center text-sm text-muted">{empty}</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {groups[key].map((order) => (
                <SellerOrderCard
                  key={order.id}
                  order={order}
                  busy={busyId === order.id}
                  showStore={stores.size > 1}
                  onAdvance={advance}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
