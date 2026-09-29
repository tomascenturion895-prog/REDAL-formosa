/** Resultado de pedirle a la base que marque un pedido como entregado con el código del comprador. */
export type PinResult = "ok" | "pin_requerido" | "pin_incorrecto" | "pin_bloqueado";

export const PIN_LENGTH = 4;

/** Lo que se le muestra a quien entrega cuando el código no alcanzó. */
export const PIN_MESSAGE: Record<Exclude<PinResult, "ok">, string> = {
  pin_requerido: "Pedile al comprador su código de entrega de 4 dígitos.",
  pin_incorrecto: "Ese código no es el del pedido. Revisalo con el comprador e intentá de nuevo.",
  pin_bloqueado: "Hubo demasiados intentos con código incorrecto. Esperá 15 minutos o pedile ayuda al comprador.",
};

/** Deja solo dígitos y corta al largo del código: para el campo de texto. */
export function sanitizePin(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, PIN_LENGTH);
}

export const isCompletePin = (pin: string) => pin.length === PIN_LENGTH;

/** Normaliza lo que devuelve la base; cualquier valor inesperado se trata como error de código. */
export function parsePinResult(value: unknown): PinResult {
  return value === "ok" || value === "pin_requerido" || value === "pin_bloqueado" ? value : "pin_incorrecto";
}
