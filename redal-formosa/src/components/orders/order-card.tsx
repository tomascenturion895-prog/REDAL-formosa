import Link from "next/link";
import { orderHistoryService, type OrderSummary } from "@/lib/orders/order-history-service";

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusEmoji = orderHistoryService.getStatusEmoji(order.estado);
  const statusLabel = orderHistoryService.getStatusLabel(order.estado);
  const orderDate = new Date(order.creado_en).toLocaleDateString("es-AR");

  const statusColors: Record<string, string> = {
    pendiente: "bg-warning-soft text-warning",
    confirmado: "bg-info-soft text-info",
    en_preparacion: "bg-highlight-soft text-highlight",
    en_trayecto: "bg-action-soft text-action",
    entregado: "bg-success-soft text-success",
    cancelado: "bg-danger-soft text-danger",
  };

  return (
    <Link href={`/mis-pedidos/${order.id}`}>
      <div className="rounded-card border border-border bg-surface p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-muted">Pedido #{order.id.slice(0, 8)}</p>
            <p className="text-xs text-muted mt-1">{orderDate}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.estado] || "bg-surface-muted"}`}>
            {statusEmoji} {statusLabel}
          </span>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Items:</span>
            <span className="font-medium">{order.cantidad_items}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Unidades:</span>
            <span className="font-medium">{order.total_unidades}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-action">
            <span>Total:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-3 text-right">
          <span className="text-xs text-link hover:underline">Ver detalles →</span>
        </div>
      </div>
    </Link>
  );
}
