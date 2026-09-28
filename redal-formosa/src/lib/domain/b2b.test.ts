import { describe, expect, it } from "vitest";

import { daysLeft, offerMessage, validateB2BRequest, type B2BRequestInput } from "./b2b";

const valid: B2BRequestInput = {
  razonSocial: "Restaurante El Lapacho",
  tipo: "restaurante",
  localidad: "Formosa Capital",
  cuit: "",
  contacto: "Ana Pérez",
  telefono: "3704 123456",
  productos: "Mandioca, tomate",
  volumen: "100 kg semanales",
  frecuencia: "semanal",
  mensaje: "",
};

describe("validateB2BRequest", () => {
  it("acepta una solicitud completa, con o sin CUIT", () => {
    expect(validateB2BRequest(valid)).toBeNull();
    expect(validateB2BRequest({ ...valid, cuit: "30-12345678-9" })).toBeNull();
    expect(validateB2BRequest({ ...valid, cuit: "30123456789" })).toBeNull();
  });

  it("pide lo que falta con un mensaje claro", () => {
    expect(validateB2BRequest({ ...valid, razonSocial: " " })).toBe("Completá el nombre del comercio.");
    expect(validateB2BRequest({ ...valid, telefono: "123" })).toBe("Completá el teléfono.");
    expect(validateB2BRequest({ ...valid, productos: "" })).toBe("Completá los productos que buscás.");
  });

  it("rechaza CUIT mal formado y textos demasiado largos", () => {
    expect(validateB2BRequest({ ...valid, cuit: "123" })).toMatch(/CUIT/);
    expect(validateB2BRequest({ ...valid, volumen: "x".repeat(201) })).toMatch(/demasiado largo/);
    expect(validateB2BRequest({ ...valid, mensaje: "x".repeat(501) })).toMatch(/500/);
  });
});

describe("daysLeft", () => {
  const now = new Date("2026-09-28T12:00:00Z");
  it("redondea hacia arriba y nunca es negativo", () => {
    expect(daysLeft("2026-10-28T12:00:00Z", now)).toBe(30);
    expect(daysLeft("2026-09-29T00:00:00Z", now)).toBe(1);
    expect(daysLeft("2026-09-01T00:00:00Z", now)).toBe(0);
  });
});

describe("offerMessage", () => {
  it("nombra al comercio y a quien ofrece", () => {
    const text = offerMessage({ contacto_nombre: "Ana Pérez", razon_social: "El Lapacho", productos: "mandioca" }, "Chacra El Sol");
    expect(text).toContain("Hola Ana");
    expect(text).toContain("Chacra El Sol");
    expect(text).toContain("El Lapacho");
  });
});
