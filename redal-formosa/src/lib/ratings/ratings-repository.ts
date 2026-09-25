import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap, unwrapOptional } from "@/lib/supabase/repository";
import type { Row } from "@/lib/supabase/types";

export type Rating = Row<"calificaciones">;

export interface RatingStats {
  total: number;
  promedio: number;
}

export interface RatingInput {
  puntuacion: number;
  comentario?: string;
}

export class RatingsRepository {
  constructor(private readonly db: Db = createClient()) {}

  private async currentUserId(): Promise<string> {
    const { data } = await this.db.auth.getUser();
    if (!data.user) throw new RepositoryError("Tenés que iniciar sesión para calificar");
    return data.user.id;
  }

  /** Una calificación por persona y producto: si ya existe, se actualiza. */
  async rateProduct(productId: string, { puntuacion, comentario }: RatingInput): Promise<Rating> {
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      throw new RepositoryError("La puntuación debe ser un entero de 1 a 5");
    }
    const usuario_id = await this.currentUserId();
    return await unwrap(
      this.db
        .from("calificaciones")
        .upsert(
          { usuario_id, producto_id: productId, puntuacion, comentario: comentario?.trim() || null },
          { onConflict: "usuario_id,producto_id" },
        )
        .select()
        .single(),
      "guardar calificación",
    );
  }

  async delete(ratingId: string): Promise<void> {
    const usuario_id = await this.currentUserId();
    const { error } = await this.db.from("calificaciones").delete().eq("id", ratingId).eq("usuario_id", usuario_id);
    if (error) throw new RepositoryError(`eliminar calificación: ${error.message}`, error);
  }

  async listForProduct(productId: string, limit = 10): Promise<Rating[]> {
    return await unwrap(
      this.db
        .from("calificaciones")
        .select("*")
        .eq("producto_id", productId)
        .order("creado_en", { ascending: false })
        .limit(limit),
      "listar calificaciones",
    );
  }

  async statsForProduct(productId: string): Promise<RatingStats> {
    const row = await unwrapOptional(
      this.db.from("producto_ratings").select("*").eq("id", productId).maybeSingle(),
      "cargar promedio de calificaciones",
    );
    return { total: Number(row?.total_ratings ?? 0), promedio: Number(row?.promedio_puntuacion ?? 0) };
  }

  /** Calificación que la persona con sesión ya dejó a un producto, si existe. */
  async myRatingForProduct(productId: string): Promise<Rating | null> {
    const { data } = await this.db.auth.getUser();
    if (!data.user) return null;
    return await unwrapOptional(
      this.db
        .from("calificaciones")
        .select("*")
        .eq("usuario_id", data.user.id)
        .eq("producto_id", productId)
        .maybeSingle(),
      "cargar mi calificación",
    );
  }
}

export const ratingsRepository = new RatingsRepository();
