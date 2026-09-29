"use client";

import { useState } from "react";

import { ordersRepository } from "@/lib/orders/orders-repository";
import { requestPaymentUrl } from "@/lib/payments/start-payment";
import { RedirectOverlay } from "@/components/payment/redirect-overlay";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface UnpaidOrderActionsProps {
  orderId: string;
  /** Se llama después de cancelar, para que la pantalla recargue el estado. */
  onCancelled: () => void;
}

/** Un pedido creado pero no pagado: se puede retomar el pago en Mercado Pago o cancelarlo. */
export function UnpaidOrderActions({ orderId, onCancelled }: UnpaidOrderActionsProps) {
  const [paying, setPaying] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setPaying(true);
    setError(null);
    try {
      const url = await requestPaymentUrl(orderId);
      setRedirecting(true);
      window.location.href = url;
    } catch {
      setError("No pudimos abrir Mercado Pago. Probá de nuevo en un momento.");
      setPaying(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await ordersRepository.cancelUnpaid(orderId);
      setConfirming(false);
      onCancelled();
    } catch {
      setConfirming(false);
      setError("No pudimos cancelar el pedido: puede que el pago ya se haya acreditado. Recargá la página para ver su estado.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="card space-y-3 border-warning p-6">
      {redirecting && <RedirectOverlay />}
      <h2 className="text-heading">Falta pagar este pedido</h2>
      <p className="text-sm text-muted">El emprendimiento lo recibe recién cuando se acredita el pago.</p>
      {error && <Alert tone="error">{error}</Alert>}
      <button type="button" className="btn btn-primary w-full" onClick={pay} disabled={paying || cancelling} aria-busy={paying}>
        {paying ? "Abriendo Mercado Pago…" : "Pagar con Mercado Pago"}
      </button>
      <button type="button" className="btn btn-secondary w-full" onClick={() => setConfirming(true)} disabled={paying || cancelling}>
        Cancelar pedido
      </button>

      <ConfirmDialog
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={cancel}
        title="¿Cancelar este pedido?"
        description="No se te cobró nada. Si más adelante querés comprar estos productos, vas a tener que armar el pedido de nuevo."
        confirmText="Sí, cancelar pedido"
        cancelText="Volver"
        isLoading={cancelling}
      />
    </div>
  );
}
