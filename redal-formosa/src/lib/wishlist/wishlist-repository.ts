import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap, unwrapOptional } from "@/lib/supabase/repository";
import type { CartProduct } from "@/lib/cart/cart-reducer";

export interface FavoriteProduct extends CartProduct {
  disponible: boolean;
}

const UNIQUE_VIOLATION = "23505";

export class WishlistRepository {
  constructor(private readonly db: Db = createClient()) {}

  /** Idempotente: agregar dos veces el mismo producto no es un error. */
  async add(userId: string, productId: string): Promise<void> {
    const { error } = await this.db.from("wishlist").insert({ usuario_id: userId, producto_id: productId });
    if (error && error.code !== UNIQUE_VIOLATION) throw new RepositoryError(`guardar favorito: ${error.message}`, error);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const { error } = await this.db.from("wishlist").delete().eq("usuario_id", userId).eq("producto_id", productId);
    if (error) throw new RepositoryError(`quitar favorito: ${error.message}`, error);
  }

  async listProducts(userId: string): Promise<FavoriteProduct[]> {
    const rows = await unwrap(
      this.db
        .from("wishlist")
        .select("producto:productos(id, nombre, precio, unidad, imagen_url, emprendimiento_id, disponible)")
        .eq("usuario_id", userId)
        .order("creado_en", { ascending: false }),
      "listar favoritos",
    );
    return rows.flatMap((r) => (r.producto ? [r.producto] : []));
  }

  /** Ids favoritos en una sola consulta, para pintar muchas tarjetas sin una consulta por cada una. */
  async favoriteIds(userId: string): Promise<Set<string>> {
    const rows = await unwrap(this.db.from("wishlist").select("producto_id").eq("usuario_id", userId), "cargar favoritos");
    return new Set(rows.map((r) => r.producto_id));
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const row = await unwrapOptional(
      this.db.from("wishlist").select("id").eq("usuario_id", userId).eq("producto_id", productId).maybeSingle(),
      "consultar favorito",
    );
    return row !== null;
  }
}

export const wishlistRepository = new WishlistRepository();
