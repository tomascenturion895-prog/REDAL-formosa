"use client";

import { CardIcon, CashIcon, LockIcon, QrCodeIcon, ShieldIcon, WalletIcon } from "@/components/ui/icons";
import { MercadoPagoBadge } from "./mercadopago-badge";

export type PaymentMethodId = "mercadopago_tarjeta" | "mercadopago_dinero" | "mercadopago_qr" | "efectivo";

interface PaymentOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}

const METHODS: PaymentOption[] = [
  {
    id: "mercadopago_tarjeta",
    label: "Tarjetas de crédito y débito",
    description: "Visa, Mastercard, Cabal y débito inmediato vía Mercado Pago",
    badge: "Recomendado",
    icon: <CardIcon size={20} />,
  },
  {
    id: "mercadopago_dinero",
    label: "Dinero en cuenta Mercado Pago",
    description: "Pagá al instante usando tu saldo disponible en Mercado Pago",
    icon: <WalletIcon size={20} />,
  },
  {
    id: "mercadopago_qr",
    label: "Código QR / App de celular",
    description: "Escaneá el QR con la app de Mercado Pago o billeteras virtuales",
    icon: <QrCodeIcon size={20} />,
  },
  {
    id: "efectivo",
    label: "Efectivo contra entrega",
    description: "Pagás en mano al repartidor cuando recibís tu pedido",
    icon: <CashIcon size={20} />,
  },
];

/** Permite seleccionar cómo pagar: Mercado Pago (con sus variantes) o efectivo. */
export function PaymentMethods({
  selected = "mercadopago_tarjeta",
  onSelect,
}: {
  selected?: PaymentMethodId;
  onSelect?: (method: PaymentMethodId) => void;
}) {
  return (
    <section aria-labelledby="payment-title" className="space-y-4 rounded-card border border-border-strong/40 bg-surface-muted/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="payment-title" className="font-display text-lg font-semibold">
            Cómo vas a pagar
          </h3>
          <p className="text-xs text-muted">Seleccioná tu método preferido para completar la compra.</p>
        </div>
        <MercadoPagoBadge />
      </div>

      <div role="radiogroup" aria-label="Métodos de pago disponibles" className="grid gap-2.5 sm:grid-cols-2">
        {METHODS.map(({ id, icon, label, description, badge }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect?.(id)}
              className={`flex items-start gap-3 rounded-control border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-action bg-surface ring-2 ring-action/60 shadow-sm"
                  : "border-border bg-surface hover:border-action/40 hover:bg-surface-muted/30"
              }`}
            >
              {/* Radio circle */}
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isSelected ? "border-action bg-action text-on-action" : "border-muted/50 bg-background"
                }`}
              >
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`${isSelected ? "text-action" : "text-muted"}`}>{icon}</span>
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  {badge && (
                    <span className="rounded-full bg-action/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-action">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted leading-tight">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <ul className="space-y-2 text-xs text-muted pt-1">
        <li className="flex items-start gap-2">
          <LockIcon size={15} className="mt-0.5 shrink-0 text-action" />
          Tus pagos digitales están protegidos de punta a punta con encriptación segura.
        </li>
        <li className="flex items-start gap-2">
          <ShieldIcon size={15} className="mt-0.5 shrink-0 text-action" />
          Tu pedido se confirma al instante y podés seguir cada paso en vivo desde Mis pedidos.
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
