"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { ratingsRepository } from "@/lib/ratings/ratings-repository";
import { StarRating } from "./star-rating";

interface RatingsListProps {
  productoId: string;
  limit?: number;
}

export function RatingsList({ productoId, limit = 10 }: RatingsListProps) {
  const { user } = useAuth();
  const { data: ratings, error, loading, reload } = useAsync(
    () => ratingsRepository.listForProduct(productoId, limit),
    [productoId, limit],
  );

  if (loading && !ratings) return <div aria-busy="true" className="h-16" />;

  if (error) {
    return <p className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">No pudimos cargar las calificaciones.</p>;
  }

  if (!ratings || ratings.length === 0) {
    return (
      <p className="card border-dashed px-5 py-8 text-center text-sm text-muted">
        Todavía nadie lo calificó. Sé la primera persona.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {ratings.map((rating) => (
        <li key={rating.id} className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <StarRating rating={rating.puntuacion} size="sm" />
              {rating.creado_en && <p className="mt-1 text-xs text-muted">{formatDate(rating.creado_en)}</p>}
            </div>

            {user?.id === rating.usuario_id && (
              <button
                type="button"
                className="text-xs font-medium text-danger hover:underline"
                onClick={async () => {
                  if (window.confirm("¿Eliminar tu calificación?")) {
                    await ratingsRepository.delete(rating.id);
                    reload();
                  }
                }}
              >
                Eliminar
              </button>
            )}
          </div>

          {rating.comentario && <p className="mt-2 text-sm">{rating.comentario}</p>}
        </li>
      ))}
    </ul>
  );
}
