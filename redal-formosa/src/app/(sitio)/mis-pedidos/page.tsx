"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { orderHistoryService, type OrderSummary, type OrderStats } from "@/lib/orders/order-history-service";
import { OrderCard } from "@/components/orders/order-card";

export default function MisPedidosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      const ordersData = await orderHistoryService.getOrders(user!.id);
      setOrders(ordersData);

      const statsData = await orderHistoryService.getStats(user!.id);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.estado === filterStatus)
    : orders;

  const statusOptions = [
    { value: "pendiente", label: "⏳ Pendiente" },
    { value: "confirmado", label: "✓ Confirmado" },
    { value: "en_preparacion", label: "📦 En preparación" },
    { value: "en_trayecto", label: "🚚 En trayecto" },
    { value: "entregado", label: "✓✓ Entregado" },
    { value: "cancelado", label: "✗ Cancelado" },
  ];

  if (authLoading || loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="page-container py-section space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">📋 Mis Pedidos</h1>
        <p className="text-muted">Historial de compras y detalles</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-sm text-muted">Total pedidos</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {stats.total_pedidos}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-sm text-muted">Gasto total</p>
            <p className="text-3xl font-bold text-action mt-1">
              ${stats.gasto_total?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-sm text-muted">Promedio</p>
            <p className="text-3xl font-bold text-highlight mt-1">
              ${stats.gasto_promedio?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-sm text-muted">Productos</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {stats.productos_diferentes}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="text-sm text-muted">Unidades</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {stats.total_unidades}
            </p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-card border border-border bg-surface-muted p-12 text-center space-y-4">
          <p className="text-lg text-muted">Aún no tienes pedidos</p>
          <Link
            href="/productos"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <>
          {/* Filtros de estado */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Filtrar por estado:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus(null)}
                className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                  filterStatus === null
                    ? "bg-action text-on-action"
                    : "border border-border bg-surface text-foreground hover:bg-surface-muted"
                }`}
              >
                Todos ({orders.length})
              </button>
              {statusOptions.map((status) => {
                const count = orders.filter((o) => o.estado === status.value).length;
                return (
                  <button
                    key={status.value}
                    onClick={() => setFilterStatus(status.value)}
                    className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                      filterStatus === status.value
                        ? "bg-highlight text-on-highlight"
                        : "border border-border bg-surface text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    {status.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de pedidos */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-card border border-border bg-surface-muted p-8 text-center">
              <p className="text-muted">No hay pedidos con ese estado</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 auto-rows-max">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
