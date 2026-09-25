"use client";

import { useState } from "react";
import Link from "next/link";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/domain/order-status";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { PageHeader } from "@/components/layout/page-header";
import { OrderCard } from "@/components/orders/order-card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageIcon } from "@/components/ui/icons";

async function loadHistory(userId: string) {
  const [orders, stats] = await Promise.all([ordersRepository.list(userId), ordersRepository.stats(userId)]);
  return { orders, stats };
}

export default function MisPedidosPage() {
  const { user, pending } = useRequireAuth();
  const [filter, setFilter] = useState<OrderStatus | null>(null);

  const { data, error, loading } = useAsync(() => loadHistory(user!.id), [user?.id], { enabled: Boolean(user), scope: user?.id });

  if (pending || loading) return <div className="page-container py-section" aria-busy="true" />;

  const orders = data?.orders ?? [];
  const stats = data?.stats;
  const statusesInUse = [...new Set(orders.map((o) => o.estado))];
  const visible = orders.filter((o) => !filter || o.estado === filter);

  return (
    <div className="page-container py-section">
      <PageHeader title="Mis pedidos" description="Seguí el estado de tus compras y revisá lo que pediste." />

      {error ? (
        <Alert tone="error">No pudimos cargar tus pedidos. Intentá de nuevo en unos minutos.</Alert>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={36} />}
          title="Todavía no hiciste pedidos"
          description="Cuando compres, vas a ver acá el estado de cada pedido."
          action={
            <Link href="/productos" className="btn btn-primary">
              Explorar productos
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {stats && (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Pedidos", String(stats.total_pedidos)],
                ["Gastado", formatPrice(stats.gasto_total)],
                ["Promedio por pedido", formatPrice(stats.gasto_promedio)],
                ["Productos distintos", String(stats.productos_diferentes)],
              ].map(([label, value]) => (
                <div key={label} className="card p-4">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {statusesInUse.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
              <button type="button" className="chip" aria-pressed={filter === null} onClick={() => setFilter(null)}>
                Todos ({orders.length})
              </button>
              {statusesInUse.map((status) => (
                <button key={status} type="button" className="chip" aria-pressed={filter === status} onClick={() => setFilter(status)}>
                  {ORDER_STATUS_LABEL[status]} ({orders.filter((o) => o.estado === status).length})
                </button>
              ))}
            </div>
          )}

          <ul className="grid gap-4 md:grid-cols-2">
            {visible.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
