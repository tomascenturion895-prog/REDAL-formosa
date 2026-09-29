import { afterEach, describe, expect, it, vi } from "vitest";

import { logError } from "./logger";

describe("logError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("emite una línea JSON con el mensaje y el detalle del error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("Falló algo", new Error("boom"));

    const line = JSON.parse(spy.mock.calls[0][0] as string);
    expect(line).toMatchObject({ level: "error", message: "Falló algo", detail: { name: "Error", message: "boom" } });
  });
});
