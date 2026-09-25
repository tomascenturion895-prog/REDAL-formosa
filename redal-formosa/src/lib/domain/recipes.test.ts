import { describe, expect, it } from "vitest";

import { parseRecipes } from "./recipes";

const allowed = new Set(["p1", "p2", "p3"]);

const valid = {
  titulo: "Sopa de zapallo",
  descripcion: "Simple y reconfortante.",
  pasos: ["Hervir el zapallo.", "Procesar y condimentar."],
  ingredientes: [
    { productoId: "p1", cantidad: 2 },
    { productoId: "p2", cantidad: 1 },
  ],
};

describe("parseRecipes", () => {
  it("acepta recetas bien formadas", () => {
    expect(parseRecipes({ recetas: [valid] }, allowed)).toEqual([valid]);
  });

  it("descarta ingredientes que no son del inventario y repetidos", () => {
    const [recipe] = parseRecipes(
      { recetas: [{ ...valid, ingredientes: [{ productoId: "p1", cantidad: 1 }, { productoId: "inventado", cantidad: 1 }, { productoId: "p1", cantidad: 3 }] }] },
      allowed,
    );
    expect(recipe.ingredientes).toEqual([{ productoId: "p1", cantidad: 1 }]);
  });

  it("descarta la receta si no le queda ningún ingrediente válido", () => {
    expect(parseRecipes({ recetas: [{ ...valid, ingredientes: [{ productoId: "x", cantidad: 1 }] }] }, allowed)).toEqual([]);
  });

  it("acota cantidades, pasos y cantidad de recetas", () => {
    const many = { recetas: [valid, valid, valid] };
    expect(parseRecipes(many, allowed)).toHaveLength(2);

    const [recipe] = parseRecipes(
      { recetas: [{ ...valid, pasos: Array.from({ length: 20 }, (_, i) => `Paso ${i}`), ingredientes: [{ productoId: "p1", cantidad: 99 }, { productoId: "p2", cantidad: -4 }] }] },
      allowed,
    );
    expect(recipe.pasos).toHaveLength(8);
    expect(recipe.ingredientes.map((i) => i.cantidad)).toEqual([5, 1]);
  });

  it("ignora entradas sin título o con forma inválida", () => {
    expect(parseRecipes({ recetas: [{ ...valid, titulo: "  " }, null, "receta", 3] }, allowed)).toEqual([]);
    expect(parseRecipes(null, allowed)).toEqual([]);
    expect(parseRecipes({ recetas: "no es lista" }, allowed)).toEqual([]);
  });
});
