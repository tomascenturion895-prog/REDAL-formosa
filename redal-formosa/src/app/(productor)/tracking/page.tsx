"use client";

import { useState } from "react";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { deliveryRepository } from "@/lib/delivery/delivery-repository";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import { directionsUrl, FORMOSA_CENTER } from "@/lib/domain/geo";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/layout/page-header";
import { RepartidorTracker } from "@/components/tracking/repartidor-tracker";
import { Alert } from "@/components/ui/alert";
import { isCompletePin, PIN_LENGTH, PIN_MESSAGE, sanitizePin } from "@/lib/domain/delivery-pin";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPinIcon, PhoneIcon, TruckIcon } from "@/components/ui/icons";

async function loadAssignments(userId: string) {
  const courier = await deliveryRepository.findByUser(userId);
  const orders = courier ? await deliveryRepository.activeOrders(courier.id) : [];
  return { courier, orders };
}

export default function RepartidorTrackingPage() {
  const { user, pending } = useRequireAuth();
  const { data, loading, reload } = useAsync(() => loadAssignments(user!.id), [user?.id], { enabled: Boolean(user), scope: user?.id });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const advance = async (orderId: string, estado: "en_camino" | "entregado", pin?: string) => {
    setBusy(true);
    setActionError(null);
    try {
      const result = await deliveryRepository.advance(orderId, estado, pin);
      if (result !== "ok") {
        setActionError(PIN_MESSAGE[result]);
        return;
      }
      setPin("");
      reload();
    } catch {
      setActionError("No pudimos actualizar la entrega. Recargá la pantalla e intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  if (pending || (loading && !data)) return <div className="h-40" aria-busy="true" />;

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

          <section aria-label="Datos de la entrega" className="card space-y-3 p-4">
            <p className="flex items-start gap-2 text-sm">
              <MapPinIcon size={18} className="mt-0.5 shrink-0 text-muted" />
              <span>{selected.direccion_entrega ?? "Sin dirección"}</span>
            </p>
            {selected.nota && <p className="text-sm text-muted">Indicaciones: {selected.nota}</p>}
            <div className="flex flex-col gap-2 sm:flex-row">
              {directionsUrl(selected.entrega, selected.direccion_entrega) && (
                <a
                  href={directionsUrl(selected.entrega, selected.direccion_entrega)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary flex-1"
                >
                  <MapPinIcon size={18} /> Cómo llegar
                </a>
              )}
              {selected.telefono_comprador && (
                <a href={`tel:${selected.telefono_comprador.replace(/[^\d+]/g, "")}`} className="btn btn-secondary flex-1">
                  <PhoneIcon size={18} /> Llamar al comprador
                </a>
              )}
            </div>
          </section>

          {actionError && <Alert tone="error">{actionError}</Alert>}
          {selected.estado === "listo" && (
            <button type="button" className="btn btn-primary w-full" disabled={busy} onClick={() => advance(selected.id, "en_camino")}>
              Retiré el pedido y salgo a entregar
            </button>
          )}
          {selected.estado === "en_camino" && (
            <form
              className="card space-y-3 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (isCompletePin(pin)) advance(selected.id, "entregado", pin);
              }}
            >
              <label htmlFor="pin-entrega" className="block text-sm font-medium">
                Código de entrega del comprador
              </label>
              <input
                id="pin-entrega"
                inputMode="numeric"
                autoComplete="off"
                maxLength={PIN_LENGTH}
                value={pin}
                onChange={(e) => setPin(sanitizePin(e.target.value))}
                placeholder="0000"
                className="field text-center font-display text-2xl tracking-[0.4em] tabular-nums"
                aria-describedby="pin-ayuda"
              />
              <p id="pin-ayuda" className="text-xs text-muted">
                El comprador lo ve en su pedido. Pedíselo cuando le entregues.
              </p>
              <button type="submit" className="btn btn-primary w-full" disabled={busy || !isCompletePin(pin)} aria-busy={busy}>
                Entregué el pedido
              </button>
            </form>
          )}

          <RepartidorTracker repartidorId={courier.id} destino={selected.entrega ?? FORMOSA_CENTER} isRepartidor />
          {!selected.entrega && (
            <p className="text-sm text-muted">Este pedido no tiene ubicación exacta: el mapa muestra el centro de Formosa como referencia.</p>
          )}
        </>
      )}
    </div>
  );
}
