import { parseRecipes, type Recipe } from "@/lib/domain/recipes";
import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "../errors";
import type { RecipeSuggester } from "./ports";

const MAX_PRODUCTS = 20;

export interface RecipeProduct {
  id: string;
  nombre: string;
  unidad: string;
  precio: number;
  imagen_url: string | null;
  emprendimiento_id: string;
}

export interface RecipesResult {
  recetas: Recipe[];
  /** Los productos que aparecen en las recetas, para poder agregarlos al carrito. */
  productos: RecipeProduct[];
}

/** "Recetas de Origen": con lo que vende un emprendimiento, propone 2 recetas cuyos ingredientes se pueden comprar ahí. */
export class RecipesService {
  constructor(private readonly suggester: RecipeSuggester) {}

  async suggest(db: Db, emprendimientoId: string, productIds?: readonly string[]): Promise<RecipesResult> {
    // La base ya filtra por visibilidad (solo productos publicados); acá se pide además que estén disponibles.
    const { data, error } = await db
      .from("productos")
      .select("id, nombre, unidad, precio, imagen_url, emprendimiento_id")
      .eq("emprendimiento_id", emprendimientoId)
      .eq("disponible", true)
      .limit(MAX_PRODUCTS);
    if (error) throw new ServiceError("unavailable", "No pudimos leer los productos. Probá de nuevo en un momento.");

    const wanted = productIds && productIds.length > 0 ? new Set(productIds) : null;
    const products: RecipeProduct[] = (data ?? [])
      .filter((p) => !wanted || wanted.has(p.id))
      .map((p) => ({ ...p, precio: Number(p.precio) }));

    if (products.length === 0) {
      throw new ServiceError("bad_request", "Este emprendimiento no tiene productos disponibles para armar recetas.");
    }

    const raw = await this.suggester.suggest(products.map(({ id, nombre, unidad }) => ({ id, nombre, unidad })));
    const recetas = parseRecipes(raw, new Set(products.map((p) => p.id)));
    if (recetas.length === 0) {
      throw new ServiceError("unavailable", "No se nos ocurrió una receta con estos productos. Probá de nuevo.");
    }

    const used = new Set(recetas.flatMap((r) => r.ingredientes.map((i) => i.productoId)));
    return { recetas, productos: products.filter((p) => used.has(p.id)) };
  }
}
