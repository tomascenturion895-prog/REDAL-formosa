"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon, PackageIcon } from "@/components/ui/icons";

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

  // Al volver de MercadoPago el webhook puede tardar unos segundos en confirmar el pago.
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
  const heading = paid
    ? "¡Pedido confirmado!"
    : waitingForWebhook
      ? "Estamos confirmando tu pago"
      : returnStatus === "failure"
        ? "El pago no se completó"
        : "Tu pedido está pendiente de pago";

  const detail = paid
    ? "El emprendimiento ya recibió tu pedido y lo está preparando."
    : waitingForWebhook
      ? "MercadoPago nos avisa en unos segundos. Podés cerrar esta página: lo vas a ver en Mis pedidos."
      : "Guardamos tu pedido. Se confirma cuando se acredita el pago.";

  return (
    <div className="page-container py-section">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              paid ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
            }`}
          >
            {paid ? <CheckIcon size={28} /> : <PackageIcon size={28} />}
          </span>
          <h1 className="text-title">{heading}</h1>
          <p className="max-w-md text-muted">{detail}</p>
        </div>

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
