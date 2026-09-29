"use client";

import { useState } from "react";

import { CardIcon, CashIcon, LockIcon, QrCodeIcon, ShieldIcon, WalletIcon } from "@/components/ui/icons";
import { DEFAULT_PAYMENT_METHOD, isCash, PAYMENT_METHODS, type PaymentMethod } from "@/lib/domain/payment-methods";
import { MercadoPagoBadge } from "./mercadopago-badge";

const ICON: Record<PaymentMethod, React.ReactNode> = {
  tarjeta: <CardIcon size={18} />,
  saldo: <WalletIcon size={18} />,
  qr: <QrCodeIcon size={18} />,
  efectivo: <CashIcon size={18} />,
};

interface PaymentMethodsProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/** Elección del medio de pago. Los tres primeros se cobran online por Mercado Pago; el efectivo se paga al recibir. */
export function PaymentMethods({ value, onChange }: PaymentMethodsProps) {
  return (
    <fieldset className="space-y-4 rounded-card border border-border bg-surface-muted/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <legend className="font-display text-lg font-semibold">Cómo vas a pagar</legend>
          <p className="text-xs text-muted">Seleccioná tu método preferido para completar la compra.</p>
        </div>
        <MercadoPagoBadge />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAYMENT_METHODS.map((method) => {
          const selected = value === method.id;
          return (
            <label
              key={method.id}
              className={`relative flex cursor-pointer items-start gap-3 rounded-control border p-3 transition focus-within:ring-2 focus-within:ring-action ${
                selected ? "border-action bg-surface shadow-card" : "border-border bg-surface hover:border-border-strong"
              }`}
            >
              <input
                type="radio"
                name="metodo-pago"
                value={method.id}
                checked={selected}
                onChange={() => onChange(method.id)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--action)]"
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="text-action" aria-hidden="true">
                    {ICON[method.id]}
                  </span>
                  {method.label}
                  {method.recommended && (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">Recomendado</span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-muted">{method.description}</span>
              </span>
            </label>
          );
        })}
      </div>

      <ul className="space-y-2 pt-1 text-xs text-muted">
        {isCash(value) ? (
          <>
            <li className="flex items-start gap-2">
              <CashIcon size={15} className="mt-0.5 shrink-0 text-action" />
              Pagás en mano a quien te entrega. Tené el monto justo si podés.
            </li>
            <li className="flex items-start gap-2">
              <ShieldIcon size={15} className="mt-0.5 shrink-0 text-action" />
              Te damos un código de 4 dígitos: dáselo a quien te entrega solo cuando tengas el pedido en la mano.
            </li>
          </>
        ) : (
          <>
            <li className="flex items-start gap-2">
              <LockIcon size={15} className="mt-0.5 shrink-0 text-action" />
              Los datos de tu tarjeta los maneja Mercado Pago: nosotros nunca los vemos.
            </li>
            <li className="flex items-start gap-2">
              <ShieldIcon size={15} className="mt-0.5 shrink-0 text-action" />
              Tu pedido se confirma apenas se acredita el pago y podés seguirlo desde Mis pedidos.
            </li>
          </>
        )}
      </ul>
    </fieldset>
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

/** Selector con su propio estado, para la guía de estilo. */
export function PaymentMethodsDemo() {
  const [value, setValue] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);
  return <PaymentMethods value={value} onChange={setValue} />;
}
