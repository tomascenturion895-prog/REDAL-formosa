"use client";

import { CardIcon, LockIcon, QrCodeIcon, ShieldIcon, WalletIcon } from "@/components/ui/icons";
import { MercadoPagoBadge } from "./mercadopago-badge";

const WAYS = [
  { label: "Tarjeta de crédito o débito", icon: <CardIcon size={16} /> },
  { label: "Dinero en cuenta Mercado Pago", icon: <WalletIcon size={16} /> },
  { label: "Código QR", icon: <QrCodeIcon size={16} /> },
];

/**
 * Informa cómo se paga. Todo el cobro pasa por Mercado Pago y ahí se elige el medio (tarjeta, saldo o QR),
 * por eso acá no hay una selección que no cambiaría nada.
 */
export function PaymentMethods() {
  return (
    <section aria-labelledby="payment-title" className="space-y-4 rounded-card border border-border bg-surface-muted/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="payment-title" className="font-display text-lg font-semibold">
            Cómo vas a pagar
          </h3>
          <p className="text-xs text-muted">Pagás online con Mercado Pago y elegís el medio en su pantalla.</p>
        </div>
        <MercadoPagoBadge />
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Medios disponibles en Mercado Pago">
        {WAYS.map(({ label, icon }) => (
          <li key={label} className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm">
            <span className="text-action">{icon}</span>
            {label}
          </li>
        ))}
      </ul>

      <ul className="space-y-2 pt-1 text-xs text-muted">
        <li className="flex items-start gap-2">
          <LockIcon size={15} className="mt-0.5 shrink-0 text-action" />
          Los datos de tu tarjeta los maneja Mercado Pago: nosotros nunca los vemos.
        </li>
        <li className="flex items-start gap-2">
          <ShieldIcon size={15} className="mt-0.5 shrink-0 text-action" />
          Tu pedido se confirma apenas se acredita el pago y podés seguirlo desde Mis pedidos.
        </li>
      </ul>
    </section>
  );
}

/** Versión corta para resúmenes (carrito, ficha de producto). */
export function PaymentTrust() {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted">
      <LockIcon size={14} className="text-action" />
      Pago seguro con <MercadoPagoBadge size="sm" />
    </p>
  );
}
