"use client";

import { useState } from "react";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { deliveryRepository } from "@/lib/delivery/delivery-repository";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import { FORMOSA_CENTER } from "@/lib/domain/geo";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/layout/page-header";
import { RepartidorTracker } from "@/components/tracking/repartidor-tracker";
import { EmptyState } from "@/components/ui/empty-state";
import { TruckIcon } from "@/components/ui/icons";

async function loadAssignments(userId: string) {
  const courier = await deliveryRepository.findByUser(userId);
  const orders = courier ? await deliveryRepository.activeOrders(courier.id) : [];
  return { courier, orders };
}

export default function RepartidorTrackingPage() {
  const { user, pending } = useRequireAuth();
  const { data, loading } = useAsync(() => loadAssignments(user!.id), [user?.id], { enabled: Boolean(user), scope: user?.id });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (pending || loading) return <div className="h-40" aria-busy="true" />;

  if (!data?.courier) {
    return (
      <EmptyState
        icon={<TruckIcon size={36} />}
        title="Tu cuenta no es de repartidor"
        description="Este panel es para quienes hacen entregas en RedAL."
      />
    );
  }

  const { courier, orders } = data;
  const selected = orders.find((o) => o.id === selectedId) ?? orders[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Mis entregas" description="Tu ubicación se comparte con quien espera el pedido mientras esta pantalla esté abierta." />

      {orders.length === 0 ? (
        <EmptyState icon={<TruckIcon size={36} />} title="No tenés pedidos asignados" description="Cuando te asignen uno, aparece acá." />
      ) : (
        <>
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(order.id)}
                  aria-pressed={selected.id === order.id}
                  className={`card w-full p-4 text-left transition-colors ${selected.id === order.id ? "border-action" : "hover:border-border-strong"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.numero_pedido}</p>
                      <p className="mt-1 text-sm text-muted">{order.direccion_entrega}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_TONE[order.estado]}`}>
                      {ORDER_STATUS_LABEL[order.estado]}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <RepartidorTracker repartidorId={courier.id} destino={selected.entrega ?? FORMOSA_CENTER} isRepartidor />
          {!selected.entrega && (
            <p className="text-sm text-muted">Este pedido no tiene ubicación exacta: el mapa muestra el centro de Formosa como referencia.</p>
          )}
        </>
      )}
    </div>
  );
}
