"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import { formatDate, formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { OrderItem } from "@/components/orders/order-item";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageIcon, TruckIcon } from "@/components/ui/icons";

async function loadOrder(orderId: string, userId: string) {
  const [order, items] = await Promise.all([ordersRepository.get(orderId, userId), ordersRepository.details(orderId, userId)]);
  return { order, items };
}

export default function PedidoDetallePage() {
  const { id: orderId } = useParams<{ id: string }>();
  const { user, pending } = useRequireAuth();

  const { data, loading } = useAsync(() => loadOrder(orderId, user!.id), [orderId, user?.id], { enabled: Boolean(user) });

  if (pending || loading) return <div className="page-container py-section" aria-busy="true" />;

  const order = data?.order;
  if (!order) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<PackageIcon size={36} />}
          title="No encontramos este pedido"
          action={
            <Link href="/mis-pedidos" className="btn btn-primary">
              Volver a mis pedidos
            </Link>
          }
        />
      </div>
    );
  }

  const subtotal = order.monto_total - order.monto_envio;

  return (
    <div className="page-container py-section">
      <Link href="/mis-pedidos" className="text-sm font-medium text-link hover:underline">
        Mis pedidos
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3 pb-8 pt-2">
        <div>
          <h1 className="text-title">Pedido {order.numero_pedido}</h1>
          <p className="mt-1 text-muted">
            A {order.emprendimiento_nombre} · {formatDate(order.created_at, true)}
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${ORDER_STATUS_TONE[order.estado]}`}>
          {ORDER_STATUS_LABEL[order.estado]}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="items-title" className="space-y-3">
          <h2 id="items-title" className="text-heading">
            Productos
          </h2>
          {data?.items.map((item) => <OrderItem key={item.detalle_id} item={item} />)}
        </section>

        <aside className="space-y-4">
          <div className="card space-y-4 p-6">
            <h2 className="text-heading">Resumen</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Productos</dt>
                <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Envío</dt>
                <dd className="tabular-nums">{formatPrice(order.monto_envio)}</dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(order.monto_total)}</span>
            </div>
          </div>

          {order.estado === "en_camino" && (
            <Link href={`/tracking/${order.id}`} className="btn btn-accent w-full">
              <TruckIcon size={18} /> Seguir el envío en vivo
            </Link>
          )}
          <Link href="/productos" className="btn btn-secondary w-full">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
