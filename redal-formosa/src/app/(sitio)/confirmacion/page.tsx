"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { CheckoutStepper } from "@/components/payment/checkout-stepper";
import { MercadoPagoBadge } from "@/components/payment/mercadopago-badge";
import { OrderProgress } from "@/components/payment/order-progress";
import { RedirectOverlay } from "@/components/payment/redirect-overlay";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon, PackageIcon, WalletIcon } from "@/components/ui/icons";

const POLL_MS = 4000;
const MAX_POLLS = 8;

function ConfirmacionContent() {
  const params = useSearchParams();
  const pedidoId = params.get("pedido");
  const returnStatus = params.get("status");
  const { user, pending } = useRequireAuth();

  const { data: pedido, loading, reload } = useAsync(() => ordersRepository.getConfirmation(pedidoId!), [pedidoId], {
    enabled: Boolean(user && pedidoId),
  });

  const [retrying, setRetrying] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Al volver de Mercado Pago el webhook puede tardar unos segundos en confirmar el pago.
  const waitingForWebhook = pedido?.estado === "pendiente_pago" && returnStatus === "approved";
  useEffect(() => {
    if (!waitingForWebhook) return;
    let polls = 0;
    const timer = setInterval(() => {
      if (++polls > MAX_POLLS) clearInterval(timer);
      else reload();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [waitingForWebhook, reload]);

  const retryPayment = async () => {
    if (!pedido) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const response = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: pedido.id }),
      });
      if (!response.ok) throw new Error("preference");
      const { url } = (await response.json()) as { url: string };
      setRedirecting(true);
      window.location.href = url;
    } catch {
      setRetryError("No pudimos abrir Mercado Pago. Probá de nuevo en un momento.");
      setRetrying(false);
    }
  };

  if (pending || loading) return <div className="page-container py-section" aria-busy="true" />;

  if (!pedido) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<PackageIcon size={36} />}
          title="No encontramos este pedido"
          description="Revisá que hayas iniciado sesión con la cuenta con la que compraste."
          action={
            <Link href="/mis-pedidos" className="btn btn-primary">
              Ver mis pedidos
            </Link>
          }
        />
      </div>
    );
  }

  const paid = pedido.estado !== "pendiente_pago" && pedido.estado !== "cancelado";
  const failed = !paid && !waitingForWebhook && returnStatus === "failure";
  const canRetry = pedido.estado === "pendiente_pago" && !waitingForWebhook;

  const heading = paid
    ? "¡Pedido confirmado!"
    : waitingForWebhook
      ? "Estamos confirmando tu pago"
      : failed
        ? "El pago no se completó"
        : "Tu pedido está pendiente de pago";

  const detail = paid
    ? "El emprendimiento ya recibió tu pedido y lo está preparando."
    : waitingForWebhook
      ? "Mercado Pago nos avisa en unos segundos. Podés cerrar esta página: lo vas a ver en Mis pedidos."
      : failed
        ? "No se te cobró nada. Podés intentar de nuevo con el mismo u otro medio de pago."
        : "Guardamos tu pedido. Se confirma cuando se acredita el pago.";

  const tone = paid ? "bg-success-soft text-success" : failed ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning";

  return (
    <div className="page-container py-section">
      {redirecting && <RedirectOverlay />}
      <div className="mx-auto max-w-2xl space-y-6">
        <CheckoutStepper current={2} />

        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${tone}`}>
            {waitingForWebhook && <span className="absolute inset-0 animate-ping rounded-full bg-warning-soft" aria-hidden="true" />}
            <span className="relative">
              {paid ? <CheckIcon size={30} /> : waitingForWebhook ? <WalletIcon size={30} /> : <PackageIcon size={30} />}
            </span>
          </span>
          <h1 className="text-title">{heading}</h1>
          <p className="max-w-md text-muted">{detail}</p>
          {(paid || waitingForWebhook) && <MercadoPagoBadge />}

          {canRetry && (
            <div className="mt-2 flex w-full flex-col items-center gap-3">
              {retryError && (
                <Alert tone="error" className="w-full">
                  {retryError}
                </Alert>
              )}
              <button
                type="button"
                onClick={retryPayment}
                disabled={retrying}
                aria-busy={retrying}
                className="btn btn-primary w-full !py-3 sm:w-auto sm:!px-8"
              >
                {retrying ? "Abriendo Mercado Pago…" : "Pagar con Mercado Pago"}
              </button>
            </div>
          )}
        </div>

        {paid && (
          <div className="card space-y-4 p-6">
            <h2 className="text-heading">Seguimiento</h2>
            <OrderProgress estado={pedido.estado} />
          </div>
        )}

        <dl className="card grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Número de pedido</dt>
            <dd className="mt-1 font-semibold">{pedido.numero_pedido}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Estado</dt>
            <dd className="mt-1">
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_TONE[pedido.estado]}`}>
                {ORDER_STATUS_LABEL[pedido.estado]}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Total</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{formatPrice(pedido.monto_total)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Entrega en</dt>
            <dd className="mt-1">{pedido.direccion_entrega}</dd>
          </div>
          {pedido.nota_cliente && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted">Notas</dt>
              <dd className="mt-1">{pedido.nota_cliente}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/mis-pedidos/${pedido.id}`} className="btn btn-primary flex-1">
            Ver detalle del pedido
          </Link>
          <Link href="/productos" className="btn btn-secondary flex-1">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="page-container py-section" />}>
      <ConfirmacionContent />
    </Suspense>
  );
}
