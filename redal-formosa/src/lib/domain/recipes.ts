/** Recetas sugeridas con lo que vende un emprendimiento. Reglas puras: sin I/O. */

export interface RecipeIngredient {
  productoId: string;
  cantidad: number;
}

export interface Recipe {
  titulo: string;
  descripcion: string;
  pasos: string[];
  ingredientes: RecipeIngredient[];
}

export const MAX_RECIPES = 2;
const MAX_STEPS = 8;
const MAX_QUANTITY = 5;

const text = (value: unknown, max: number): string => (typeof value === "string" ? value.trim().slice(0, max) : "");

/**
 * Valida lo que devolvió el modelo. Nunca se confía en su forma ni en los ids: solo sobreviven ingredientes
 * que son productos reales del inventario, y una receta sin ninguno válido se descarta.
 */
export function parseRecipes(raw: unknown, allowedIds: ReadonlySet<string>): Recipe[] {
  const list = typeof raw === "object" && raw !== null ? (raw as { recetas?: unknown }).recetas : undefined;
  if (!Array.isArray(list)) return [];

  const recipes: Recipe[] = [];
  for (const entry of list) {
    if (typeof entry !== "object" || entry === null) continue;
    const data = entry as Record<string, unknown>;

    const titulo = text(data.titulo, 100);
    if (!titulo) continue;

    const seen = new Set<string>();
    const ingredientes: RecipeIngredient[] = [];
    for (const item of Array.isArray(data.ingredientes) ? data.ingredientes : []) {
      const { productoId, cantidad } = (item ?? {}) as Record<string, unknown>;
      if (typeof productoId !== "string" || !allowedIds.has(productoId) || seen.has(productoId)) continue;
      seen.add(productoId);
      const amount = Number(cantidad);
      ingredientes.push({
        productoId,
        cantidad: Number.isFinite(amount) ? Math.min(MAX_QUANTITY, Math.max(1, Math.round(amount))) : 1,
      });
    }
    if (ingredientes.length === 0) continue;

    const pasos = (Array.isArray(data.pasos) ? data.pasos : [])
      .map((step) => text(step, 300))
      .filter(Boolean)
      .slice(0, MAX_STEPS);

    recipes.push({ titulo, descripcion: text(data.descripcion, 240), pasos, ingredientes });
    if (recipes.length === MAX_RECIPES) break;
  }
  return recipes;
}
