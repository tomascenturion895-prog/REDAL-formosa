import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrapOptional } from "@/lib/supabase/repository";
import type { Position } from "@/lib/geolocation/geolocation";

export interface RepartidorUbicacion {
  repartidor_id: string;
  latitud: number;
  longitud: number;
  velocidad: number | null;
  actualizado_en: string;
}

interface LocationRow {
  repartidor_id: string;
  latitud: number | null;
  longitud: number | null;
  velocidad: number | null;
  actualizado_en: string;
}

const toLocation = (row: LocationRow): RepartidorUbicacion | null =>
  row.latitud === null || row.longitud === null
    ? null
    : {
        repartidor_id: row.repartidor_id,
        latitud: row.latitud,
        longitud: row.longitud,
        velocidad: row.velocidad,
        actualizado_en: row.actualizado_en,
      };

/** Ubicación en tiempo real del repartidor (una fila por repartidor con su última posición). */
export class TrackingService {
  constructor(private readonly db: Db = createClient()) {}

  async publish(repartidorId: string, position: Position): Promise<void> {
    const { error } = await this.db.from("ubicaciones_tiempo_real").upsert(
      {
        repartidor_id: repartidorId,
        latitud: position.latitude,
        longitud: position.longitude,
        exactitud: position.accuracy,
        velocidad: position.speed ?? 0,
        rumbo: position.heading ?? 0,
      },
      { onConflict: "repartidor_id" },
    );
    if (error) throw new RepositoryError(`publicar ubicación: ${error.message}`, error);
  }

  async current(repartidorId: string): Promise<RepartidorUbicacion | null> {
    const row = await unwrapOptional(
      this.db
        .from("ubicaciones_tiempo_real")
        .select("repartidor_id, latitud, longitud, velocidad, actualizado_en")
        .eq("repartidor_id", repartidorId)
        .maybeSingle(),
      "cargar ubicación",
    );
    return row ? toLocation(row) : null;
  }

  /** Avisa cada vez que cambia la ubicación. Devuelve la función que cancela la suscripción. */
  subscribe(repartidorId: string, onUpdate: (location: RepartidorUbicacion) => void, onError?: (e: Error) => void): () => void {
    const channel = this.db
      .channel(`tracking:${repartidorId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ubicaciones_tiempo_real", filter: `repartidor_id=eq.${repartidorId}` },
        (payload) => {
          const location = toLocation(payload.new as LocationRow);
          if (location) onUpdate(location);
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") onError?.(new Error("No pudimos conectarnos al seguimiento en vivo"));
      });

    return () => {
      void this.db.removeChannel(channel);
    };
  }
}

export const trackingService = new TrackingService();
