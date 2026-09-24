"use client";

import { useState } from "react";
import { ratingsService } from "@/lib/ratings/ratings-service";
import { useAuth } from "@/lib/auth/auth-context";
import { StarRating } from "./star-rating";

interface RatingFormProps {
  productoId?: string;
  repartidorId?: string;
  onSuccess?: () => void;
  currentRating?: number;
  currentComment?: string;
  isEditing?: boolean;
  ratingId?: string;
}

export function RatingForm({
  productoId,
  repartidorId,
  onSuccess,
  currentRating = 5,
  currentComment = "",
  isEditing = false,
  ratingId,
}: RatingFormProps) {
  const { user, loading: authLoading } = useAuth();
  const [rating, setRating] = useState(currentRating);
  const [comment, setComment] = useState(currentComment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        setError("Debes estar logueado para calificar");
        return;
      }

      if (!productoId && !repartidorId) {
        setError("Error: No se especificó qué calificar");
        return;
      }

      if (isEditing && ratingId) {
        await ratingsService.updateRating(ratingId, {
          puntuacion: rating,
          comentario: comment || undefined,
        });
      } else {
        await ratingsService.createRating({
          producto_id: productoId,
          repartidor_id: repartidorId,
          puntuacion: rating,
          comentario: comment || undefined,
        });
      }

      setSuccess(true);
      setComment("");
      setRating(5);

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar calificación");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="text-center text-muted">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-control bg-info-soft p-4 text-sm text-info">
        <p className="font-medium">Debes estar logueado para calificar</p>
        <a href="/login" className="mt-2 inline-block text-link hover:underline">
          Ir a login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {isEditing ? "Actualizar calificación" : "Tu calificación"}
        </label>
        <StarRating
          rating={rating}
          interactive={true}
          onRate={setRating}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
          Comentario (opcional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia..."
          rows={3}
          maxLength={500}
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted mt-1">{comment.length}/500</p>
      </div>

      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-control bg-success-soft px-4 py-3 text-sm text-success">
          ✓ Calificación guardada correctamente
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="w-full rounded-control bg-action px-4 py-3 font-medium text-on-action hover:bg-action-hover disabled:opacity-60 transition-colors"
      >
        {loading ? "Guardando..." : isEditing ? "Actualizar" : "Enviar calificación"}
      </button>
    </form>
  );
}
