import { describe, expect, it } from "vitest";

import { editSendsToReview, type ProductContent } from "./product-edit";

const base: ProductContent = { nombre: "Miel", descripcion: "Pura de abeja", imagen_url: "https://x/img.jpg" };

describe("editSendsToReview", () => {
  it("no pide revisión si no cambió el contenido", () => {
    expect(editSendsToReview(base, { ...base })).toBe(false);
  });
  it("ignora espacios sobrantes y null vs vacío", () => {
    expect(editSendsToReview({ ...base, descripcion: null }, { ...base, descripcion: "  " })).toBe(false);
    expect(editSendsToReview(base, { ...base, nombre: " Miel " })).toBe(false);
  });
  it.each([
    ["nombre", { nombre: "Miel de caña" }],
    ["descripción", { descripcion: "Otra" }],
    ["foto", { imagen_url: null }],
  ])("pide revisión si cambia el/la %s", (_label, change) => {
    expect(editSendsToReview(base, { ...base, ...change })).toBe(true);
  });
});
