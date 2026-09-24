import { createClient } from "@/lib/supabase/client";

export interface RecommendedProduct {
  producto_id: string;
  nombre: string;
  precio: number;
  imagen_principal?: string;
  relevancia?: number;
  razon?: string;
}

export interface TopProduct extends RecommendedProduct {
  veces_comprado: number;
  total_vendido: number;
  promedio_cantidad: number;
}

export interface NewProduct {
  id: string;
  nombre: string;
  precio: number;
  imagen_principal?: string;
  categoria?: string;
  creado_en: string;
}

export class RecommendationsService {
  private supabase = createClient();

  /**
   * Obtener recomendaciones basadas en favoritos del usuario
   */
  async getRecommendationsByFavorites(
    userId: string,
    limit: number = 8
  ): Promise<RecommendedProduct[]> {
    try {
      const { data, error } = await (this.supabase
        .from("usuario_recomendaciones_favoritos")
        .select("*")
        .eq("usuario_id", userId)
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting recommendations by favorites:", error);
      return [];
    }
  }

  /**
   * Obtener recomendaciones basadas en historial de compras
   */
  async getRecommendationsByPurchases(
    userId: string,
    limit: number = 8
  ): Promise<RecommendedProduct[]> {
    try {
      const { data, error } = await (this.supabase
        .from("usuario_recomendaciones_compras")
        .select("*")
        .eq("usuario_id", userId)
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting recommendations by purchases:", error);
      return [];
    }
  }

  /**
   * Obtener productos más vendidos (trending)
   */
  async getTrendingProducts(limit: number = 8): Promise<TopProduct[]> {
    try {
      const { data, error } = await (this.supabase
        .from("top_products")
        .select("*")
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting trending products:", error);
      return [];
    }
  }

  /**
   * Obtener productos nuevos
   */
  async getNewProducts(limit: number = 8): Promise<NewProduct[]> {
    try {
      const { data, error } = await (this.supabase
        .from("nuevos_productos")
        .select("*")
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting new products:", error);
      return [];
    }
  }

  /**
   * Obtener productos similares a uno específico
   */
  async getSimilarProducts(
    productId: string,
    limit: number = 6
  ): Promise<RecommendedProduct[]> {
    try {
      const { data, error } = await (this.supabase
        .from("productos_similares")
        .select("similar_id as producto_id, nombre, precio, imagen_principal, relevancia")
        .eq("producto_id", productId)
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting similar products:", error);
      return [];
    }
  }

  /**
   * Obtener recomendaciones personalizadas para usuario
   * Combina: favoritos, compras, trending
   */
  async getPersonalizedRecommendations(
    userId: string | null,
    limit: number = 12
  ): Promise<RecommendedProduct[]> {
    try {
      if (!userId) {
        return this.getTrendingProducts(limit);
      }

      const [favorites, purchases] = await Promise.all([
        this.getRecommendationsByFavorites(userId, limit / 2),
        this.getRecommendationsByPurchases(userId, limit / 2),
      ]);

      const combined = [...favorites, ...purchases];
      const unique = Array.from(
        new Map(combined.map((item) => [item.producto_id, item])).values()
      );

      return unique.slice(0, limit);
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return this.getTrendingProducts(limit);
    }
  }

  /**
   * Registrar interacción (vista, favorito, compra)
   */
  async logInteraction(
    userId: string,
    productId: string,
    type: "vista" | "favorito" | "compra"
  ): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("product_interactions")
        .insert({
          usuario_id: userId,
          producto_id: productId,
          tipo: type,
        }));

      if (error && error.code !== "23505") throw error;
      return true;
    } catch (error) {
      console.error("Error logging interaction:", error);
      return false;
    }
  }
}

export const recommendationsService = new RecommendationsService();
