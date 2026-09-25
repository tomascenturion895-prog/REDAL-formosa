import { WalletIcon } from "@/components/ui/icons";

/**
 * Identifica a Mercado Pago como medio de pago. Usa los tokens celeste ("río") del sistema.
 * Para mostrar el logotipo oficial, guardarlo en `public/brand/` y reemplazar el ícono por un <Image>.
 */
export function MercadoPagoBadge({ size = "md" }: { size?: "md" | "sm" }) {
  const small = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-info-soft font-semibold text-info ${
        small ? "py-0.5 pl-1 pr-2.5 text-xs" : "py-1 pl-1.5 pr-3 text-sm"
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-sky-600 text-white ${small ? "h-5 w-5" : "h-6 w-6"}`}
        aria-hidden="true"
      >
        <WalletIcon size={small ? 12 : 14} />
      </span>
      Mercado Pago
    </span>
  );
}
