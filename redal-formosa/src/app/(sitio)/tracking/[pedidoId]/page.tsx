"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import { FORMOSA_CENTER } from "@/lib/domain/geo";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { RepartidorTracker } from "@/components/tracking/repartidor-tracker";
import { LoadError } from "@/components/ui/load-error";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageIcon, TruckIcon } from "@/components/ui/icons";

export default function TrackingPage() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const { user, pending } = useRequireAuth();
  const { data: pedido, error, loading, reload } = useAsync(() => ordersRepository.getConfirmation(pedidoId), [pedidoId], {
    enabled: Boolean(user),
  });

  if (pending || (loading && !pedido)) return <div className="page-container py-section" aria-busy="true" />;

  if (error && !pedido) {
    return (
      <div className="page-container py-section">
        <LoadError title="No pudimos cargar el seguimiento" onRetry={reload} />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<PackageIcon size={36} />}
          title="No encontramos este pedido"
          action={
            <Link href="/mis-pedidos" className="btn btn-primary">
              Ver mis pedidos
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link href={`/mis-pedidos/${pedido.id}`} className="text-sm font-medium text-link hover:underline">
            Pedido {pedido.numero_pedido}
          </Link>
          <h1 className="text-title mt-1">Seguimiento del envío</h1>
        </div>

        <dl className="card grid gap-5 p-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Estado</dt>
            <dd className="mt-1">
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_TONE[pedido.estado]}`}>
                {ORDER_STATUS_LABEL[pedido.estado]}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Entrega en</dt>
            <dd className="mt-1">{pedido.direccion_entrega}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Total</dt>
            <dd className="mt-1 font-display text-lg font-bold">{formatPrice(pedido.monto_total)}</dd>
          </div>
        </dl>

        {pedido.repartidor_id ? (
          <RepartidorTracker repartidorId={pedido.repartidor_id} destino={pedido.entrega ?? FORMOSA_CENTER} isRepartidor={false} />
        ) : pedido.estado === "en_camino" || pedido.estado === "entregado" ? (
          <EmptyState
            icon={<TruckIcon size={36} />}
            title={pedido.estado === "entregado" ? "Tu pedido fue entregado" : "Tu pedido va en camino"}
            description="Lo entrega el propio emprendimiento, por eso no hay recorrido en el mapa. Si tenés dudas, escribile desde el detalle del pedido."
          />
        ) : (
          <EmptyState
            icon={<TruckIcon size={36} />}
            title="Todavía no hay un repartidor asignado"
            description="Apenas alguien tome tu pedido vas a ver su recorrido en el mapa."
          />
        )}
      </div>
    </div>
  );
}
