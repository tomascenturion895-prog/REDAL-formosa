import { LockIcon } from "@/components/ui/icons";
import { MercadoPagoBadge } from "./mercadopago-badge";

/** Pantalla completa mientras se lleva a la persona a Mercado Pago (evita clics dobles y explica la espera). */
export function RedirectOverlay() {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="redirect-title"
      aria-describedby="redirect-desc"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/90 p-6 backdrop-blur-sm"
    >
      <div className="card flex max-w-sm flex-col items-center gap-4 p-8 text-center shadow-pop">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-action" aria-hidden="true" />
        <h2 id="redirect-title" className="font-display text-xl font-semibold">
          Te llevamos a Mercado Pago
        </h2>
        <MercadoPagoBadge />
        <p id="redirect-desc" className="text-sm text-muted">
          Tu pedido ya está guardado. En unos segundos vas a poder elegir cómo pagar.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <LockIcon size={14} /> No cierres esta ventana.
        </p>
      </div>
    </div>
  );
}
