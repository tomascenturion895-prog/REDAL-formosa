import { createClient, type Db } from "@/lib/supabase/client";
import { unwrap, unwrapOptional } from "@/lib/supabase/repository";
import type { Row } from "@/lib/supabase/types";

export type Product = Row<"productos">;
export type Emprendimiento = Row<"emprendimientos">;

export interface ProductSearchResult {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  unidad: string;
  disponible: boolean;
  imagen_url: string | null;
  emprendimiento_id: string;
  created_at: string;
  relevance: number;
}

export interface SearchFilters {
  query: string;
  priceMax?: number;
  disponibleOnly?: boolean;
}

export interface RatingSummary {
  promedio: number;
  total: number;
}

const PRICE_CEILING = 999_999_999;

/** Lectura del catálogo público: productos, emprendimientos y sus calificaciones. */
export class CatalogRepository {
  constructor(private readonly db: Db = createClient()) {}

  /** Búsqueda full-text en español. Con query vacío devuelve lo más reciente. */
  async searchProducts({ query, priceMax, disponibleOnly = false }: SearchFilters): Promise<ProductSearchResult[]> {
    const rows = await unwrap(
      this.db.rpc("search_productos", {
        search_query: query.trim(),
        price_max: priceMax || PRICE_CEILING,
        disponible_only: disponibleOnly,
      }),
      "buscar productos",
    );
    return rows.map((r) => ({ ...r, descripcion: r.descripcion ?? null, imagen_url: r.imagen_url ?? null }));
  }

  /** Producto con el nombre de su emprendimiento, en una sola consulta. */
  async getProduct(id: string): Promise<(Product & { emprendimiento: { id: string; nombre: string } | null }) | null> {
    return await unwrapOptional(
      this.db
        .from("productos")
        .select("*, emprendimiento:emprendimientos(id, nombre)")
        .eq("id", id)
        .maybeSingle(),
      "cargar producto",
    );
  }

  async listEmprendimientos(): Promise<Emprendimiento[]> {
    return await unwrap(
      this.db.from("emprendimientos").select("*").eq("activo", true).order("created_at", { ascending: false }),
      "listar emprendimientos",
    );
  }

  async getEmprendimiento(id: string): Promise<Emprendimiento | null> {
    return await unwrapOptional(
      this.db.from("emprendimientos").select("*").eq("id", id).maybeSingle(),
      "cargar emprendimiento",
    );
  }

  async listAvailableProducts(emprendimientoId: string): Promise<Product[]> {
    return await unwrap(
      this.db.from("productos").select("*").eq("emprendimiento_id", emprendimientoId).eq("disponible", true),
      "listar productos del emprendimiento",
    );
  }

  /** id → nombre para un conjunto de emprendimientos (evita una consulta por tarjeta). */
  async getEmprendimientoNames(ids: readonly string[]): Promise<Record<string, string>> {
    if (ids.length === 0) return {};
    const rows = await unwrap(
      this.db.from("emprendimientos").select("id, nombre").in("id", [...new Set(ids)]),
      "cargar nombres de emprendimientos",
    );
    return Object.fromEntries(rows.map((e) => [e.id, e.nombre]));
  }

  /** Promedio y cantidad de calificaciones para varios productos en una consulta. */
  async getRatingSummaries(productIds: readonly string[]): Promise<Record<string, RatingSummary>> {
    if (productIds.length === 0) return {};
    const rows = await unwrap(
      this.db.from("producto_ratings").select("id, total_ratings, promedio_puntuacion").in("id", [...productIds]),
      "cargar calificaciones",
    );
    return Object.fromEntries(
      rows.flatMap((r) =>
        r.id ? [[r.id, { promedio: Number(r.promedio_puntuacion ?? 0), total: Number(r.total_ratings ?? 0) }]] : [],
      ),
    );
  }
}

export const catalogRepository = new CatalogRepository();
