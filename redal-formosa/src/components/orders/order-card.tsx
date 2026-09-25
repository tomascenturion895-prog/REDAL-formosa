import Link from "next/link";

import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import type { OrderSummary } from "@/lib/orders/orders-repository";

export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link href={`/mis-pedidos/${order.id}`} className="card block p-5 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display font-semibold">{order.emprendimiento_nombre}</p>
          <p className="mt-0.5 text-sm text-muted">
            {order.numero_pedido} · {formatDate(order.created_at)}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_TONE[order.estado]}`}>
          {ORDER_STATUS_LABEL[order.estado]}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
        <p className="text-sm text-muted">
          {order.total_unidades} {order.total_unidades === 1 ? "unidad" : "unidades"}
        </p>
        <p className="font-display text-xl font-bold tabular-nums">{formatPrice(order.monto_total)}</p>
      </div>
    </Link>
  );
}
