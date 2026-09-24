import { createClient } from "@/lib/supabase/client";

type Calificacion = any;

export interface CreateRatingData {
  producto_id?: string;
  repartidor_id?: string;
  puntuacion: number;
  comentario?: string;
}

export interface RatingStats {
  total_ratings: number;
  promedio_puntuacion: number;
  puntuacion_minima: number;
  puntuacion_maxima: number;
}

export class RatingsService {
  private supabase = createClient();

  async createRating(data: CreateRatingData): Promise<Calificacion | null> {
    try {
      if (!data.producto_id && !data.repartidor_id) {
        throw new Error("Debe especificar producto_id o repartidor_id");
      }

      if (data.puntuacion < 1 || data.puntuacion > 5) {
        throw new Error("La puntuación debe estar entre 1 y 5");
      }

      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) throw new Error("No autorizado");

      const { data: rating, error } = await (this.supabase
        .from("calificaciones")
        .insert({
          usuario_id: user.user.id,
          producto_id: data.producto_id || null,
          repartidor_id: data.repartidor_id || null,
          puntuacion: data.puntuacion,
          comentario: data.comentario || null,
        } as any)
        .select()
        .single() as any);

      if (error) throw error;
      return rating;
    } catch (err) {
      console.error("Error creating rating:", err);
      throw err;
    }
  }

  async updateRating(id: string, data: Partial<CreateRatingData>): Promise<Calificacion | null> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) throw new Error("No autorizado");

      const updateData: any = {};
      if (data.puntuacion !== undefined) updateData.puntuacion = data.puntuacion;
      if (data.comentario !== undefined) updateData.comentario = data.comentario;

      const { data: rating, error } = await ((this.supabase as any)
        .from("calificaciones")
        .update(updateData)
        .eq("id", id)
        .eq("usuario_id", user.user.id)
        .select()
        .single());

      if (error) throw error;
      return rating;
    } catch (err) {
      console.error("Error updating rating:", err);
      throw err;
    }
  }

  async deleteRating(id: string): Promise<void> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) throw new Error("No autorizado");

      const { error } = await (this.supabase
        .from("calificaciones")
        .delete()
        .eq("id", id)
        .eq("usuario_id", user.user.id) as any);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting rating:", err);
      throw err;
    }
  }

  async getProductRatings(productoId: string, limit: number = 10): Promise<Calificacion[]> {
    try {
      const { data, error } = await this.supabase
        .from("calificaciones")
        .select("*")
        .eq("producto_id", productoId)
        .order("creado_en", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error getting product ratings:", err);
      return [];
    }
  }

  async getRepartidorRatings(repartidorId: string, limit: number = 10): Promise<Calificacion[]> {
    try {
      const { data, error } = await this.supabase
        .from("calificaciones")
        .select("*")
        .eq("repartidor_id", repartidorId)
        .order("creado_en", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error getting repartidor ratings:", err);
      return [];
    }
  }

  async getProductStats(productoId: string): Promise<RatingStats | null> {
    try {
      const { data, error } = await (this.supabase
        .from("producto_ratings")
        .select("*")
        .eq("id", productoId)
        .single() as any);

      if (error && error.code !== "PGRST116") throw error;
      return data ? {
        total_ratings: data.total_ratings || 0,
        promedio_puntuacion: data.promedio_puntuacion || 0,
        puntuacion_minima: data.puntuacion_minima || 0,
        puntuacion_maxima: data.puntuacion_maxima || 0,
      } : null;
    } catch (err) {
      console.error("Error getting product stats:", err);
      return null;
    }
  }

  async getRepartidorStats(repartidorId: string): Promise<RatingStats | null> {
    try {
      const { data, error } = await (this.supabase
        .from("repartidor_ratings")
        .select("*")
        .eq("id", repartidorId)
        .single() as any);

      if (error && error.code !== "PGRST116") throw error;
      return data ? {
        total_ratings: data.total_ratings || 0,
        promedio_puntuacion: data.promedio_puntuacion || 0,
        puntuacion_minima: data.puntuacion_minima || 0,
        puntuacion_maxima: data.puntuacion_maxima || 0,
      } : null;
    } catch (err) {
      console.error("Error getting repartidor stats:", err);
      return null;
    }
  }

  async getUserRating(
    productoId?: string,
    repartidorId?: string
  ): Promise<Calificacion | null> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) return null;

      let query = this.supabase
        .from("calificaciones")
        .select("*")
        .eq("usuario_id", user.user.id);

      if (productoId) query = query.eq("producto_id", productoId);
      if (repartidorId) query = query.eq("repartidor_id", repartidorId);

      const { data, error } = await (query.single() as any);

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (err) {
      console.error("Error getting user rating:", err);
      return null;
    }
  }
}

export const ratingsService = new RatingsService();
