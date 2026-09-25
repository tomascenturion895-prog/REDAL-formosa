import { CardIcon, LockIcon, ShieldIcon, WalletIcon } from "@/components/ui/icons";
import { MercadoPagoBadge } from "./mercadopago-badge";

const METHODS = [
  { icon: <CardIcon size={20} />, label: "Tarjetas de crédito y débito" },
  { icon: <WalletIcon size={20} />, label: "Dinero en tu cuenta de Mercado Pago" },
] as const;

/** Explica cómo se paga: la compra se completa en Mercado Pago, donde se elige el medio. */
export function PaymentMethods() {
  return (
    <section aria-labelledby="payment-title" className="space-y-4 rounded-card border border-border-strong/40 bg-surface-muted/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="payment-title" className="font-display text-lg font-semibold">
          Cómo vas a pagar
        </h3>
        <MercadoPagoBadge />
      </div>

      <p className="text-sm text-muted">
        Al continuar te llevamos a la pantalla segura de Mercado Pago, donde elegís el medio de pago que prefieras.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {METHODS.map(({ icon, label }) => (
          <li key={label} className="flex items-center gap-3 rounded-control border border-border bg-surface px-3 py-2.5 text-sm font-medium">
            <span className="text-action">{icon}</span>
            {label}
          </li>
        ))}
      </ul>

      <ul className="space-y-2 text-sm text-muted">
        <li className="flex items-start gap-2">
          <LockIcon size={16} className="mt-0.5 shrink-0 text-action" />
          Los datos de tu tarjeta los procesa Mercado Pago: RedAL nunca los ve ni los guarda.
        </li>
        <li className="flex items-start gap-2">
          <ShieldIcon size={16} className="mt-0.5 shrink-0 text-action" />
          Tu pedido se confirma apenas se acredita el pago, y podés seguirlo en Mis pedidos.
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
