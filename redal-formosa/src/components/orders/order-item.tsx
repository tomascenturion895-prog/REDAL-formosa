import Link from "next/link";
import { type OrderDetail } from "@/lib/orders/order-history-service";

interface OrderItemProps {
  item: OrderDetail;
}

export function OrderItem({ item }: OrderItemProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex gap-4">
        {item.producto_imagen && (
          <img
            src={item.producto_imagen}
            alt={item.producto_nombre}
            className="w-20 h-20 object-cover rounded-control bg-surface-muted"
          />
        )}

        <div className="flex-1">
          <Link href={`/productos/${item.producto_id}`}>
            <h3 className="font-semibold text-foreground hover:text-action transition-colors">
              {item.producto_nombre}
            </h3>
          </Link>

          <p className="text-sm text-muted mt-1">
            {item.producto_unidad}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div className="text-sm">
              <span className="text-muted">Cantidad: </span>
              <span className="font-medium">{item.cantidad}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Unitario</p>
              <p className="font-medium">${item.precio_unitario.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted">Subtotal</p>
            <p className="text-lg font-bold text-action">
              ${item.subtotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
