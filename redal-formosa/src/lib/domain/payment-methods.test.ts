import { describe, expect, it } from "vitest";

import { excludedMercadoPagoTypes, isCash, isPaymentMethod, PAYMENT_METHODS } from "./payment-methods";

describe("medios de pago", () => {
  it("ofrece cuatro medios y solo el primero es el recomendado", () => {
    expect(PAYMENT_METHODS.map((m) => m.id)).toEqual(["tarjeta", "saldo", "qr", "efectivo"]);
    expect(PAYMENT_METHODS.filter((m) => m.recommended).map((m) => m.id)).toEqual(["tarjeta"]);
  });

  it("solo el efectivo se cobra fuera de Mercado Pago", () => {
    expect(PAYMENT_METHODS.filter((m) => isCash(m.id)).map((m) => m.id)).toEqual(["efectivo"]);
    expect(isCash(null)).toBe(false);
  });

  it("reconoce solo los medios válidos", () => {
    expect(isPaymentMethod("qr")).toBe(true);
    expect(isPaymentMethod("bitcoin")).toBe(false);
    expect(isPaymentMethod(undefined)).toBe(false);
  });

  it("con tarjeta no se ofrece saldo y con saldo no se ofrecen tarjetas", () => {
    expect(excludedMercadoPagoTypes("tarjeta")).toContain("account_money");
    expect(excludedMercadoPagoTypes("tarjeta")).not.toContain("credit_card");
    expect(excludedMercadoPagoTypes("saldo")).toEqual(expect.arrayContaining(["credit_card", "debit_card"]));
    expect(excludedMercadoPagoTypes("saldo")).not.toContain("account_money");
    expect(excludedMercadoPagoTypes("qr")).toEqual([]);
  });
});
