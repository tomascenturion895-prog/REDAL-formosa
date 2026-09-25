/** Enlaces de WhatsApp para teléfonos argentinos. Reglas puras: sin I/O. */

const COUNTRY = "54";
const MOBILE = "9";
// Código de área (2 a 4 dígitos) + abonado = 10 dígitos. Con el "15" del celular son 12.
const NATIONAL_LENGTH = 10;
const NATIONAL_LENGTH_WITH_15 = 12;

/**
 * Lleva un teléfono argentino al formato de WhatsApp: `549` + código de área + número.
 * Acepta espacios, guiones, paréntesis y "+"; quita el 0 inicial del área y el 15 del celular, y agrega
 * el 9 si el número ya venía con 54. Devuelve null si no parece un número real.
 */
export function normalizeArgentinePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith(COUNTRY)) {
    digits = digits.slice(COUNTRY.length);
    if (digits.startsWith(MOBILE)) digits = digits.slice(MOBILE.length);
  }

  digits = digits.replace(/^0+/, "");

  if (digits.length === NATIONAL_LENGTH_WITH_15) {
    const areaLength = [2, 3, 4].find((length) => digits.slice(length, length + 2) === "15");
    if (areaLength) digits = digits.slice(0, areaLength) + digits.slice(areaLength + 2);
  }

  return new RegExp(`^[1-9]\\d{${NATIONAL_LENGTH - 1}}$`).test(digits) ? `${COUNTRY}${MOBILE}${digits}` : null;
}

/** URL de `wa.me` con el mensaje ya codificado, o null si el teléfono no es utilizable (no se muestra el botón). */
export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null;
  const number = normalizeArgentinePhone(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}
