import { describe, expect, it } from "vitest";

import { snippet } from "./public-catalog";

describe("snippet", () => {
  it("usa el texto de respaldo cuando no hay descripción", () => {
    expect(snippet(null, "fallback")).toBe("fallback");
    expect(snippet("   ", "fallback")).toBe("fallback");
  });

  it("normaliza espacios y saltos de línea", () => {
    expect(snippet("Miel\n\n  pura", "x")).toBe("Miel pura");
  });

  it("recorta lo que excede el máximo y agrega puntos suspensivos", () => {
    const result = snippet("a".repeat(300), "x", 50);
    expect(result).toHaveLength(50);
    expect(result.endsWith("…")).toBe(true);
  });
});
