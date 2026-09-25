import { describe, expect, it } from "vitest";

import { normalizeArgentinePhone, whatsappLink } from "./whatsapp";

describe("normalizeArgentinePhone", () => {
  it.each([
    ["3704 123456", "5493704123456"],
    ["3704-123456", "5493704123456"],
    ["(3704) 123456", "5493704123456"],
    ["0370 15 4123456", "5493704123456"],
    ["03704 15-123456", "5493704123456"],
    ["370 4123456", "5493704123456"],
    ["011 15 5678 1234", "5491156781234"],
    ["11 5678 1234", "5491156781234"],
  ])("limpia y completa %s", (raw, expected) => expect(normalizeArgentinePhone(raw)).toBe(expected));

  it.each([
    ["+54 3704 123456", "5493704123456"],
    ["543704123456", "5493704123456"],
    ["+54 9 3704 123456", "5493704123456"],
    ["5493704123456", "5493704123456"],
    ["+54 9 11 5678-1234", "5491156781234"],
    ["0054 9 3704 123456", "5493704123456"],
  ])("respeta el prefijo 54 e inyecta el 9 si falta: %s", (raw, expected) => {
    expect(normalizeArgentinePhone(raw)).toBe(expected);
  });

  it("no toca un número que ya está completo aunque un tramo parezca 15", () => {
    expect(normalizeArgentinePhone("3715 151515")).toBe("5493715151515");
  });

  it.each(["", "   ", "abc", "123", "15 4123456", "4123456", "3704 12345", "3704 1234567890", "0000000000"])(
    "devuelve null para %j",
    (raw) => expect(normalizeArgentinePhone(raw)).toBeNull(),
  );
});

describe("whatsappLink", () => {
  it("arma la URL con el mensaje codificado", () => {
    expect(whatsappLink("3704 123456", "Hola, vi tu producto Miel & más")).toBe(
      "https://wa.me/5493704123456?text=Hola%2C%20vi%20tu%20producto%20Miel%20%26%20m%C3%A1s",
    );
  });

  it("devuelve null si no hay teléfono utilizable", () => {
    expect(whatsappLink(null, "Hola")).toBeNull();
    expect(whatsappLink(undefined, "Hola")).toBeNull();
    expect(whatsappLink("no es un teléfono", "Hola")).toBeNull();
  });
});
