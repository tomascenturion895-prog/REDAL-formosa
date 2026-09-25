import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { OrderDetail } from "@/lib/orders/orders-repository";
import { ProductImage } from "@/components/ui/product-image";

export function OrderItem({ item }: { item: OrderDetail }) {
  return (
    <div className="card flex gap-4 p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-muted">
        <ProductImage src={item.producto_imagen} sizes="64px" iconSize={24} />
      </div>

      <div className="min-w-0 flex-1">
        <Link href={`/productos/${item.producto_id}`} className="font-display font-semibold hover:text-action">
          {item.producto_nombre}
        </Link>
        <p className="text-sm text-muted">
          {item.cantidad} × {formatPrice(item.precio_unitario)} · {item.producto_unidad}
        </p>
      </div>

      <p className="font-display text-lg font-bold tabular-nums">{formatPrice(item.subtotal)}</p>
    </div>
  );
}
