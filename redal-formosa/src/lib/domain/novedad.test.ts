import { describe, expect, it } from "vitest";

import { cleanNovedad, NOVEDAD_MAX_CHARS } from "./novedad";

describe("cleanNovedad", () => {
  it("recorta espacios", () => {
    expect(cleanNovedad("  Hay zapallo  ")).toBe("Hay zapallo");
  });
  it("rechaza texto vacío", () => {
    expect(() => cleanNovedad("   ")).toThrow();
  });
  it("acepta exactamente el máximo y rechaza pasarse", () => {
    expect(cleanNovedad("a".repeat(NOVEDAD_MAX_CHARS))).toHaveLength(NOVEDAD_MAX_CHARS);
    expect(() => cleanNovedad("a".repeat(NOVEDAD_MAX_CHARS + 1))).toThrow();
  });
});
