import { createClient } from "@/lib/supabase/client";

export interface WishlistItem {
  id: string;
  producto_id: string;
  creado_en: string;
  producto?: {
    id: string;
    nombre: string;
    precio: number;
    imagen_principal?: string;
  };
}

export class WishlistService {
  private supabase = createClient();

  /**
   * Agregar producto a favoritos
   */
  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("wishlist")
        .insert({ usuario_id: userId, producto_id: productId }));

      if (error) {
        if (error.code === "23505") return true;
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return false;
    }
  }

  /**
   * Remover producto de favoritos
   */
  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("wishlist")
        .delete()
        .eq("usuario_id", userId)
        .eq("producto_id", productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  }

  /**
   * Obtener lista de favoritos del usuario
   */
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await (this.supabase
        .from("wishlist")
        .select(
          `
          id,
          producto_id,
          creado_en,
          producto:producto_id (
            id,
            nombre,
            precio,
            imagen_principal
          )
          `
        )
        .eq("usuario_id", userId)
        .order("creado_en", { ascending: false }) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return [];
    }
  }

  /**
   * Verificar si un producto está en favoritos
   */
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await (this.supabase
        .from("wishlist")
        .select("id")
        .eq("usuario_id", userId)
        .eq("producto_id", productId)
        .single() as any);

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  }

  /**
   * Limpiar favoritos del usuario
   */
  async clearWishlist(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("wishlist")
        .delete()
        .eq("usuario_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      return false;
    }
  }

  /**
   * Obtener cantidad de favoritos
   */
  async getWishlistCount(userId: string): Promise<number> {
    try {
      const { count, error } = await (this.supabase
        .from("wishlist")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", userId) as any);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error getting wishlist count:", error);
      return 0;
    }
  }
}

export const wishlistService = new WishlistService();
