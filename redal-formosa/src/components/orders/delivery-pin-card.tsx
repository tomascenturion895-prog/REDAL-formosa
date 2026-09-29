"use client";

import { useAsync } from "@/lib/hooks/use-async";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { LockIcon } from "@/components/ui/icons";

/** El código que el comprador le dice a quien le entrega: sin él, el pedido no se puede marcar como entregado. */
export function DeliveryPinCard({ orderId }: { orderId: string }) {
  const { data: pin } = useAsync(() => ordersRepository.getDeliveryPin(orderId), [orderId]);
  if (!pin) return null;

  return (
    <section aria-labelledby="pin-title" className="card border-action bg-success-soft space-y-2 p-5">
      <h2 id="pin-title" className="flex items-center gap-2 text-heading">
        <LockIcon size={18} /> Tu código de entrega
      </h2>
      <p className="font-display text-4xl font-bold tracking-[0.3em] tabular-nums" aria-label={`Código ${pin.split("").join(" ")}`}>
        {pin}
      </p>
      <p className="text-sm text-muted">Dáselo a quien te entrega solo cuando tengas el pedido en la mano. No lo compartas antes.</p>
    </section>
  );
}
