import { createClient } from "@/lib/supabase/client";

export interface SearchResult {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  unidad: string;
  disponible: boolean;
  imagen_principal?: string;
  creado_en: string;
  relevance: number;
}

export interface SearchFilters {
  query: string;
  priceMin?: number;
  priceMax?: number;
  disponibleOnly?: boolean;
}

export interface Category {
  categoria: string;
  total_productos: number;
  precio_promedio: number;
  precio_minimo: number;
  precio_maximo: number;
  disponibles: number;
}

export class SearchService {
  private supabase = createClient();

  /**
   * Búsqueda full-text con filtros
   */
  async search(filters: SearchFilters): Promise<SearchResult[]> {
    try {
      const query = filters.query || "";
      const priceMin = filters.priceMin || 0;
      const priceMax = filters.priceMax || 999999;
      const disponibleOnly = filters.disponibleOnly || false;

      const result = await ((this.supabase as any)
        .rpc("search_productos", {
          search_query: query,
          price_min: priceMin,
          price_max: priceMax,
          disponible_only: disponibleOnly,
        }));

      const { data, error } = result;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching:", error);
      return [];
    }
  }

  /**
   * Obtener categorías con estadísticas
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await (this.supabase
        .from("categoria_stats")
        .select("*")
        .order("total_productos", { ascending: false }) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }

  /**
   * Búsqueda simple sin full-text (fallback)
   */
  async simpleSearch(query: string, limit: number = 20): Promise<SearchResult[]> {
    try {
      const { data, error } = await (this.supabase
        .from("productos")
        .select("id, nombre, descripcion, precio, unidad, disponible, imagen_principal, creado_en")
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
        .eq("validado", true)
        .order("creado_en", { ascending: false })
        .limit(limit) as any);

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        relevance: 1,
      }));
    } catch (error) {
      console.error("Error in simple search:", error);
      return [];
    }
  }

  /**
   * Autocompletado - sugerir productos
   */
  async autocomplete(query: string, limit: number = 5): Promise<string[]> {
    try {
      if (query.length < 2) return [];

      const { data, error } = await (this.supabase
        .from("productos")
        .select("nombre")
        .ilike("nombre", `%${query}%`)
        .eq("validado", true)
        .limit(limit) as any);

      if (error) throw error;
      const names = (data || []).map((p: any) => p.nombre as string);
      return [...new Set(names)] as string[];
    } catch (error) {
      console.error("Error in autocomplete:", error);
      return [];
    }
  }

  /**
   * Búsqueda por categoría
   */
  async searchByCategory(
    categoria: string,
    priceMin?: number,
    priceMax?: number
  ): Promise<SearchResult[]> {
    try {
      let query = this.supabase
        .from("productos")
        .select("id, nombre, descripcion, precio, unidad, disponible, imagen_principal, creado_en")
        .eq("categoria", categoria)
        .eq("validado", true);

      if (priceMin !== undefined) {
        query = query.gte("precio", priceMin);
      }
      if (priceMax !== undefined) {
        query = query.lte("precio", priceMax);
      }

      const { data, error } = await (query
        .order("precio", { ascending: true })
        .limit(50) as any);

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        relevance: 1,
      }));
    } catch (error) {
      console.error("Error searching by category:", error);
      return [];
    }
  }
}

export const searchService = new SearchService();
