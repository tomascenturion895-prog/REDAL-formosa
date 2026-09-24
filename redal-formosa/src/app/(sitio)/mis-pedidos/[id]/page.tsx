"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { orderHistoryService, type OrderSummary, type OrderDetail } from "@/lib/orders/order-history-service";
import { OrderItem } from "@/components/orders/order-item";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [items, setItems] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

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
      const orderData = await orderHistoryService.getOrder(orderId);

      if (!orderData) {
        router.push("/mis-pedidos");
        return;
      }

      if (orderData.usuario_id !== user?.id) {
        router.push("/mis-pedidos");
        return;
      }

      setOrder(orderData);

      const itemsData = await orderHistoryService.getOrderDetails(orderId, user!.id);
      setItems(itemsData);
    } catch (err) {
      console.error("Error loading order:", err);
      router.push("/mis-pedidos");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!order) {
    return <div className="text-center py-12">Pedido no encontrado</div>;
  }

  const statusEmoji = orderHistoryService.getStatusEmoji(order.estado);
  const statusLabel = orderHistoryService.getStatusLabel(order.estado);
  const orderDate = new Date(order.creado_en).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusColors: Record<string, string> = {
    pendiente: "bg-warning-soft text-warning",
    confirmado: "bg-info-soft text-info",
    en_preparacion: "bg-highlight-soft text-highlight",
    en_trayecto: "bg-action-soft text-action",
    entregado: "bg-success-soft text-success",
    cancelado: "bg-danger-soft text-danger",
  };

  return (
    <div className="page-container py-section space-y-8">
      {/* Header */}
      <div>
        <Link href="/mis-pedidos" className="text-link hover:underline text-sm">
          ← Volver a mis pedidos
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <p className="text-muted">{orderDate}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items del pedido */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-heading mb-4">📦 Artículos ({items.length})</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <OrderItem key={item.detalle_id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar con información */}
        <div className="space-y-6">
          {/* Estado */}
          <div className="rounded-card border border-border bg-surface p-6">
            <h3 className="text-heading mb-4">Estado</h3>
            <div className={`px-4 py-3 rounded-control text-center font-medium ${statusColors[order.estado]}`}>
              <span className="text-lg mr-2">{statusEmoji}</span>
              {statusLabel}
            </div>
          </div>

          {/* Resumen */}
          <div className="rounded-card border border-border bg-surface p-6 space-y-3">
            <h3 className="text-heading mb-4">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Artículos:</span>
                <span className="font-medium">{order.cantidad_items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Unidades:</span>
                <span className="font-medium">{order.total_unidades}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-action">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="rounded-card border border-border bg-surface p-6 space-y-3">
            <h3 className="text-heading mb-4">Detalles</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted mb-1">Creado el:</p>
                <p className="font-medium">{new Date(order.creado_en).toLocaleDateString("es-AR")}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Última actualización:</p>
                <p className="font-medium">{new Date(order.actualizado_en).toLocaleDateString("es-AR")}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/productos"
            className="block text-center rounded-control bg-highlight px-4 py-3 font-medium text-on-highlight hover:opacity-90 transition-opacity"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
