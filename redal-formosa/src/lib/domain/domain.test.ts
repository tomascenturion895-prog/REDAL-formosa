import { describe, expect, it } from "vitest";

import { isValidCbu } from "./cbu";
import { distanceKm, FORMOSA_CENTER } from "./geo";
import { isPaid, PAID_STATUSES } from "./order-status";
import { estimarEnvio, subtotal } from "./pricing";

describe("isValidCbu", () => {
  // Bloque 1: 0170001 + dígito 5. Bloque 2: 1234567890123 + dígito 3 (calculados a mano con los pesos del BCRA).
  const VALID = "0170001512345678901233";

  it("acepta un CBU con ambos dígitos verificadores correctos", () => {
    expect(isValidCbu(VALID)).toBe(true);
  });

  it("rechaza si falla el verificador del banco/sucursal", () => {
    expect(isValidCbu("0170001612345678901233")).toBe(false);
  });

  it("rechaza si falla el verificador de la cuenta", () => {
    expect(isValidCbu("0170001512345678901234")).toBe(false);
  });

  it("rechaza largo incorrecto o caracteres no numéricos", () => {
    expect(isValidCbu("")).toBe(false);
    expect(isValidCbu(VALID.slice(1))).toBe(false);
    expect(isValidCbu(`${VALID}0`)).toBe(false);
    expect(isValidCbu("01700015123456789012ab")).toBe(false);
  });
});

describe("pricing", () => {
  it("el envío estimado replica calcular_envio(): 100 + 50 por línea, 0 sin líneas", () => {
    expect(estimarEnvio(0)).toBe(0);
    expect(estimarEnvio(1)).toBe(150);
    expect(estimarEnvio(3)).toBe(250);
  });

  it("suma precio por cantidad aceptando números o texto (numeric de Postgres)", () => {
    expect(subtotal([{ precio: 1000, cantidad: 3 }, { precio: "250.50", cantidad: 2 }])).toBe(3501);
    expect(subtotal([])).toBe(0);
  });
});

describe("order-status", () => {
  it("solo cuentan como pagados los estados posteriores al pago", () => {
    expect(isPaid("pendiente_pago")).toBe(false);
    expect(isPaid("cancelado")).toBe(false);
    expect(PAID_STATUSES.every(isPaid)).toBe(true);
  });
});

describe("distanceKm", () => {
  it("es cero entre el mismo punto", () => {
    expect(distanceKm(FORMOSA_CENTER, FORMOSA_CENTER)).toBe(0);
  });

  it("un grado de latitud son unos 111 km", () => {
    const d = distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    expect(d).toBeGreaterThan(111);
    expect(d).toBeLessThan(111.5);
  });

  it("es simétrica", () => {
    const a = { lat: -26.18, lng: -58.18 };
    const b = { lat: -25.27, lng: -57.63 };
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 10);
  });
});
