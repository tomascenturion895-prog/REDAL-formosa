import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GeolocationCoordinates } from "@/lib/geolocation/geo-service";

export interface RepartidorUbicacion {
  id: string;
  repartidor_id: string;
  latitud: number;
  longitud: number;
  exactitud: number;
  velocidad?: number;
  rumbo?: number;
  actualizado_en: string;
}

export class TrackingService {
  private supabase = createClient();
  private channel: RealtimeChannel | null = null;

  async updateRepartidorLocation(
    repartidorId: string,
    coords: GeolocationCoordinates
  ): Promise<void> {
    try {
      const { error } = await (this.supabase
        .from("ubicaciones_tiempo_real")
        .upsert(
          {
            repartidor_id: repartidorId,
            latitud: coords.latitude,
            longitud: coords.longitude,
            exactitud: coords.accuracy,
            velocidad: coords.speed || 0,
            rumbo: coords.heading || 0,
            actualizado_en: new Date().toISOString(),
          } as any
        ) as any);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating location:", err);
      throw err;
    }
  }

  subscribeToRepartidorTracking(
    repartidorId: string,
    onLocationUpdate: (location: RepartidorUbicacion) => void,
    onError?: (error: Error) => void
  ): void {
    this.channel = this.supabase
      .channel(`tracking:${repartidorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ubicaciones_tiempo_real",
          filter: `repartidor_id=eq.${repartidorId}`,
        },
        (payload: any) => {
          onLocationUpdate(payload.new as RepartidorUbicacion);
        }
      )
      .subscribe((status: any) => {
        if (status === "CHANNEL_ERROR" && onError) {
          onError(new Error("Failed to subscribe to tracking updates"));
        }
      });
  }

  unsubscribeFromTracking(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  async getRepartidorCurrentLocation(
    repartidorId: string
  ): Promise<RepartidorUbicacion | null> {
    try {
      const { data, error } = await this.supabase
        .from("ubicaciones_tiempo_real")
        .select("*")
        .eq("repartidor_id", repartidorId)
        .order("actualizado_en", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (err) {
      console.error("Error getting location:", err);
      return null;
    }
  }

  async getLocationHistory(
    repartidorId: string,
    limit: number = 100
  ): Promise<RepartidorUbicacion[]> {
    try {
      const { data, error } = await this.supabase
        .from("ubicaciones_tiempo_real")
        .select("*")
        .eq("repartidor_id", repartidorId)
        .order("actualizado_en", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error getting history:", err);
      return [];
    }
  }
}

export const trackingService = new TrackingService();
