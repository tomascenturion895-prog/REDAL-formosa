"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { formatPrice } from "@/lib/format";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { requestPaymentUrl } from "@/lib/payments/start-payment";
import { CheckIcon, ExternalLinkIcon, RefreshIcon } from "@/components/ui/icons";
import { Alert } from "@/components/ui/alert";

const POLL_MS = 4000;
const MAX_POLLS = 60; // ~4 minutos; después queda el enlace a «Ver estado del pedido»

interface CheckoutMercadoPagoProps {
  orderId: string;
  amount: number;
  onPaid: () => void;
}

/**
 * Pago de un pedido ya creado. La URL la genera el servidor (que lee montos y dueño de la base) y el
 * pedido se da por pagado solo cuando el webhook firmado lo confirma: acá únicamente se observa su estado.
 * En escritorio se ofrece un QR para pagar desde el celular sin salir de esta pantalla.
 */
export function CheckoutMercadoPago({ orderId, amount, onPaid }: CheckoutMercadoPagoProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // El callback llega inline desde la página: se guarda en una ref para no reiniciar el sondeo en cada render.
  const onPaidRef = useRef(onPaid);
  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    let active = true;
    requestPaymentUrl(orderId)
      .then((generated) => active && setUrl(generated))
      .catch(() => active && setError("No pudimos generar el pago con Mercado Pago. Probá de nuevo en un momento."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [orderId, attempt]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  // Detecta que el pago se acreditó (por ejemplo, pagando con el QR desde el celular).
  useEffect(() => {
    if (paid) return;
    let polls = 0;
    const timer = setInterval(async () => {
      if (++polls > MAX_POLLS) {
        clearInterval(timer);
        return;
      }
      try {
        const order = await ordersRepository.getConfirmation(orderId);
        if (order && order.estado !== "pendiente_pago" && order.estado !== "cancelado") {
          clearInterval(timer);
          setPaid(true);
          onPaidRef.current();
        }
      } catch {
        // Un fallo de red puntual no debe cortar el sondeo.
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [orderId, paid]);

  if (paid) {
    return (
      <div role="status" className="rounded-card border border-border bg-success-soft p-6 text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-success">
          <CheckIcon size={28} />
        </span>
        <h2 className="text-heading">¡Recibimos tu pago!</h2>
        <p className="mt-2 text-sm text-muted">Te llevamos al detalle de tu pedido.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-heading">Pagar con Mercado Pago</h2>
          <p className="text-xs text-muted">Se acredita al instante y te avisamos acá.</p>
        </div>
        <div className="text-right">
          <span className="block text-xs text-muted">Total</span>
          <span className="font-display text-xl font-bold tabular-nums">{formatPrice(amount)}</span>
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mb-4">
          <span className="block">{error}</span>
          <button type="button" onClick={retry} className="mt-2 font-semibold underline">
            Reintentar
          </button>
        </Alert>
      )}

      {loading && !url && (
        <div className="flex flex-col items-center gap-3 py-10" role="status">
          <RefreshIcon size={28} className="animate-spin text-action" />
          <span className="text-sm font-medium text-muted">Generando el pago…</span>
        </div>
      )}

      {url && (
        <div className="space-y-5">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full !py-3 text-base">
            Pagar con Mercado Pago <ExternalLinkIcon size={18} />
          </a>

          {/* El QR solo tiene sentido en pantallas grandes: en un celular se paga con el botón. */}
          <div className="hidden flex-col items-center gap-3 border-t border-border pt-5 text-center md:flex">
            <p className="text-sm text-muted">¿Preferís pagar desde tu celular? Escaneá el código.</p>
            <div className="rounded-card bg-white p-3 shadow-sm">
              <QRCodeSVG value={url} size={180} level="M" marginSize={2} title="Código QR para pagar con Mercado Pago" />
            </div>
          </div>

          <p className="flex items-center justify-center gap-2 text-xs text-muted" role="status">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Esperando la acreditación del pago…
          </p>
        </div>
      )}
    </div>
  );
}
