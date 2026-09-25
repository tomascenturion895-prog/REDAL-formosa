"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { useAsync } from "@/lib/hooks/use-async";
import { ratingsRepository } from "@/lib/ratings/ratings-repository";
import { StarRating } from "./star-rating";

interface RatingFormProps {
  productoId: string;
  onSuccess?: () => void;
}

export function RatingForm({ productoId, onSuccess }: RatingFormProps) {
  const { user, loading: authLoading } = useAuth();

  // Si la persona ya calificó, el formulario parte de su calificación y permite editarla.
  const { data: previous } = useAsync(() => ratingsRepository.myRatingForProduct(productoId), [user?.id, productoId], {
    enabled: Boolean(user),
    scope: user?.id,
  });

  const [stars, setStars] = useState<number | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const rating = stars ?? previous?.puntuacion ?? 0;
  const text = comment ?? previous?.comentario ?? "";
  const hasPrevious = Boolean(previous) || savedOnce;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setMessage({ type: "error", text: "Elegí una puntuación de 1 a 5 estrellas." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await ratingsRepository.rateProduct(productoId, { puntuacion: rating, comentario: text });
      setSavedOnce(true);
      setMessage({ type: "ok", text: "Guardamos tu calificación." });
      onSuccess?.();
    } catch {
      setMessage({ type: "error", text: "No pudimos guardar tu calificación. Intentá de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <p className="rounded-control bg-info-soft px-4 py-3 text-sm text-info">
        <Link href="/login" className="font-medium underline">
          Ingresá
        </Link>{" "}
        para calificar este producto.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">{hasPrevious ? "Tu calificación" : "¿Cuántas estrellas le das?"}</p>
        <StarRating rating={rating} interactive onRate={setStars} size="lg" />
      </div>

      <div>
        <label htmlFor="rating-comment" className="mb-1 block text-sm font-medium">
          Comentario <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id="rating-comment"
          value={text}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contá cómo fue tu experiencia"
          rows={3}
          maxLength={500}
          className="field"
        />
        <p className="mt-1 text-xs text-muted">{text.length}/500</p>
      </div>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-control px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          }`}
        >
          {message.text}
        </p>
      )}

      <button type="submit" disabled={saving} aria-busy={saving} className="btn btn-primary w-full">
        {saving ? "Guardando…" : hasPrevious ? "Actualizar calificación" : "Enviar calificación"}
      </button>
    </form>
  );
}
