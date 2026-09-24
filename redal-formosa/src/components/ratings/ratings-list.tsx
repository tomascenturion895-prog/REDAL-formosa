"use client";

import { useEffect, useState } from "react";
import { ratingsService } from "@/lib/ratings/ratings-service";
import { useAuth } from "@/lib/auth/auth-context";
import { StarRating } from "./star-rating";

type Calificacion = any;

interface RatingsListProps {
  productoId?: string;
  repartidorId?: string;
  limit?: number;
}

export function RatingsList({
  productoId,
  repartidorId,
  limit = 10,
}: RatingsListProps) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRatings();
  }, [productoId, repartidorId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      let data: Calificacion[] = [];

      if (productoId) {
        data = await ratingsService.getProductRatings(productoId, limit);
      } else if (repartidorId) {
        data = await ratingsService.getRepartidorRatings(repartidorId, limit);
      }

      setRatings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando calificaciones");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted">Cargando calificaciones...</div>;
  }

  if (error) {
    return <div className="text-center text-danger text-sm">{error}</div>;
  }

  if (ratings.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface-muted p-6 text-center">
        <p className="text-muted">Aún no hay calificaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div
          key={rating.id}
          className="rounded-card border border-border bg-surface p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <StarRating rating={rating.puntuacion} interactive={false} size="sm" />
              <p className="text-xs text-muted mt-1">
                {new Date(rating.creado_en).toLocaleDateString("es-AR")}
              </p>
            </div>

            {user?.id === rating.usuario_id && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // TODO: Implementar edición
                  }}
                  className="text-xs text-link hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={async () => {
                    if (confirm("¿Eliminar calificación?")) {
                      await ratingsService.deleteRating(rating.id);
                      loadRatings();
                    }
                  }}
                  className="text-xs text-danger hover:underline"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>

          {rating.comentario && (
            <p className="text-foreground text-sm">{rating.comentario}</p>
          )}
        </div>
      ))}
    </div>
  );
}
