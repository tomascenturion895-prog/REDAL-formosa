import { createClient, type Db } from "@/lib/supabase/client";
import { unwrap } from "@/lib/supabase/repository";

export interface RecommendedProduct {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
}

export type RecommendationKind = "personalized" | "bestsellers" | "similar";

/** Una estrategia por tipo de recomendación: agregar una nueva no toca las existentes. */
type Loader = (db: Db, limit: number, productId?: string) => Promise<RecommendedProduct[]>;

const normalize = (r: { imagen_url?: string | null; precio: number }) => ({
  imagen_url: r.imagen_url ?? null,
  precio: Number(r.precio),
});

const LOADERS: Record<RecommendationKind, Loader> = {
  personalized: async (db, limit) => {
    const rows = await unwrap(db.rpc("recomendaciones_usuario", { max_results: limit }), "recomendaciones personalizadas");
    return rows.map((r) => ({ id: r.producto_id, nombre: r.nombre, ...normalize(r) }));
  },

  bestsellers: async (db, limit) => {
    const rows = await unwrap(db.rpc("productos_mas_vendidos", { max_results: limit }), "productos más vendidos");
    return rows.map((r) => ({ id: r.producto_id, nombre: r.nombre, ...normalize(r) }));
  },

  similar: async (db, limit, productId) => {
    if (!productId) return [];
    const rows = await unwrap(
      db
        .from("productos_similares")
        .select("similar_id, nombre, precio, imagen_url, relevancia")
        .eq("producto_id", productId)
        .order("relevancia", { ascending: false })
        .limit(limit),
      "productos similares",
    );
    return rows.flatMap((r) =>
      r.similar_id && r.nombre ? [{ id: r.similar_id, nombre: r.nombre, ...normalize({ ...r, precio: r.precio ?? 0 }) }] : [],
    );
  },
};

export class RecommendationsRepository {
  constructor(private readonly db: Db = createClient()) {}

  load(kind: RecommendationKind, limit = 8, productId?: string): Promise<RecommendedProduct[]> {
    return LOADERS[kind](this.db, limit, productId);
  }
}

export const recommendationsRepository = new RecommendationsRepository();
