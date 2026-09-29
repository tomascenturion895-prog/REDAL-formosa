/** Medios de pago que ofrece el checkout. Los tres primeros se cobran online por Mercado Pago. */
export type PaymentMethod = "tarjeta" | "saldo" | "qr" | "efectivo";

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "tarjeta";

export interface PaymentMethodInfo {
  id: PaymentMethod;
  label: string;
  description: string;
  recommended?: boolean;
}

export const PAYMENT_METHODS: readonly PaymentMethodInfo[] = [
  {
    id: "tarjeta",
    label: "Tarjeta de crédito o débito",
    description: "Visa, Mastercard, Cabal y débito inmediato vía Mercado Pago.",
    recommended: true,
  },
  { id: "saldo", label: "Dinero en cuenta Mercado Pago", description: "Pagá al instante usando tu saldo disponible en Mercado Pago." },
  { id: "qr", label: "Código QR / App de celular", description: "Escaneá el QR con la app de Mercado Pago o billeteras virtuales." },
  { id: "efectivo", label: "Efectivo contra entrega", description: "Pagás en mano cuando recibís tu pedido." },
];

const METHOD_IDS = PAYMENT_METHODS.map((m) => m.id) as readonly string[];

export const isPaymentMethod = (value: unknown): value is PaymentMethod => typeof value === "string" && METHOD_IDS.includes(value);

/** El efectivo no pasa por Mercado Pago: se cobra en mano al entregar. */
export const isCash = (method: PaymentMethod | null | undefined) => method === "efectivo";

/**
 * Tipos de pago de Mercado Pago que se excluyen para respetar lo que eligió la persona:
 * con tarjeta no se ofrece saldo ni transferencia, y con saldo solo se ofrece el saldo.
 * El QR no se puede forzar desde Checkout Pro: Mercado Pago lo muestra dentro de sus opciones.
 */
export function excludedMercadoPagoTypes(method: PaymentMethod): string[] {
  switch (method) {
    case "tarjeta":
      return ["account_money", "ticket", "atm", "bank_transfer"];
    case "saldo":
      return ["credit_card", "debit_card", "prepaid_card", "ticket", "atm", "bank_transfer"];
    default:
      return [];
  }
}
