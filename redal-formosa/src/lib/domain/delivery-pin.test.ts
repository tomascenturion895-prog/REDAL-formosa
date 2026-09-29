import { describe, expect, it } from "vitest";

import { isCompletePin, parsePinResult, sanitizePin } from "./delivery-pin";

describe("delivery-pin", () => {
  it("deja solo dígitos y corta a 4", () => {
    expect(sanitizePin("12 a3-45678")).toBe("1234");
    expect(sanitizePin("")).toBe("");
  });

  it("un código está completo con 4 dígitos", () => {
    expect(isCompletePin("123")).toBe(false);
    expect(isCompletePin("1234")).toBe(true);
  });

  it("acepta los resultados conocidos y trata lo demás como incorrecto", () => {
    expect(parsePinResult("ok")).toBe("ok");
    expect(parsePinResult("pin_bloqueado")).toBe("pin_bloqueado");
    expect(parsePinResult("pin_requerido")).toBe("pin_requerido");
    expect(parsePinResult(null)).toBe("pin_incorrecto");
    expect(parsePinResult("cualquier cosa")).toBe("pin_incorrecto");
  });
});
