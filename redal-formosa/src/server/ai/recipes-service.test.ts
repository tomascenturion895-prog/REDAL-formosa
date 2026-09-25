import { describe, expect, it, vi } from "vitest";

import type { Db } from "@/lib/supabase/types";
import type { RecipeSuggester } from "./ports";
import { RecipesService } from "./recipes-service";

const rows = [
  { id: "p1", nombre: "Mandioca fresca", unidad: "kg", precio: "1500", imagen_url: null, emprendimiento_id: "e1" },
  { id: "p2", nombre: "Queso criollo", unidad: "kg", precio: 11500, imagen_url: null, emprendimiento_id: "e1" },
  { id: "p3", nombre: "Miel de monte", unidad: "unidad", precio: 6500, imagen_url: null, emprendimiento_id: "e1" },
];

function fakeDb(result: { data: unknown; error: unknown } = { data: rows, error: null }): Db {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.eq = () => builder;
  builder.limit = () => Promise.resolve(result);
  return { from: () => builder } as unknown as Db;
}

const recipe = { titulo: "Mandioca con queso", descripcion: "Simple.", pasos: ["Hervir.", "Gratinar."], ingredientes: [{ productoId: "p1", cantidad: 1 }, { productoId: "p2", cantidad: 1 }] };

describe("RecipesService", () => {
  it("devuelve recetas y solo los productos que usan", async () => {
    const suggester: RecipeSuggester = { suggest: vi.fn().mockResolvedValue({ recetas: [recipe] }) };
    const result = await new RecipesService(suggester).suggest(fakeDb(), "e1");

    expect(result.recetas).toHaveLength(1);
    expect(result.productos.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(result.productos[0].precio).toBe(1500);
    expect(suggester.suggest).toHaveBeenCalledWith([
      { id: "p1", nombre: "Mandioca fresca", unidad: "kg" },
      { id: "p2", nombre: "Queso criollo", unidad: "kg" },
      { id: "p3", nombre: "Miel de monte", unidad: "unidad" },
    ]);
  });

  it("acota el inventario a los productos pedidos", async () => {
    const suggester: RecipeSuggester = { suggest: vi.fn().mockResolvedValue({ recetas: [recipe] }) };
    await new RecipesService(suggester).suggest(fakeDb(), "e1", ["p1"]);
    expect(suggester.suggest).toHaveBeenCalledWith([{ id: "p1", nombre: "Mandioca fresca", unidad: "kg" }]);
  });

  it("ignora ingredientes inventados por el modelo", async () => {
    const suggester: RecipeSuggester = {
      suggest: vi.fn().mockResolvedValue({ recetas: [{ ...recipe, ingredientes: [{ productoId: "inventado", cantidad: 1 }, { productoId: "p3", cantidad: 2 }] }] }),
    };
    const result = await new RecipesService(suggester).suggest(fakeDb(), "e1");
    expect(result.recetas[0].ingredientes).toEqual([{ productoId: "p3", cantidad: 2 }]);
  });

  it("falla con mensaje claro si no hay productos o si el modelo no sirve", async () => {
    const suggester: RecipeSuggester = { suggest: vi.fn().mockResolvedValue(null) };
    await expect(new RecipesService(suggester).suggest(fakeDb({ data: [], error: null }), "e1")).rejects.toMatchObject({ code: "bad_request" });
    expect(suggester.suggest).not.toHaveBeenCalled();
    await expect(new RecipesService(suggester).suggest(fakeDb(), "e1")).rejects.toMatchObject({ code: "unavailable" });
  });

  it("traduce un error de base a un error esperable", async () => {
    const suggester: RecipeSuggester = { suggest: vi.fn() };
    await expect(new RecipesService(suggester).suggest(fakeDb({ data: null, error: { message: "boom" } }), "e1")).rejects.toMatchObject({ code: "unavailable" });
  });
});
