"use client";

import { useState } from "react";

import { StarIcon } from "@/components/ui/icons";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const PX = { sm: 16, md: 20, lg: 28 } as const;

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRate,
  className = "",
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? Math.round(Math.min(Math.max(rating, 0), maxStars));

  if (!interactive) {
    return (
      <span
        className={`inline-flex gap-0.5 ${className}`}
        role="img"
        aria-label={`${Number(rating).toFixed(1)} de ${maxStars} estrellas`}
      >
        {Array.from({ length: maxStars }).map((_, i) => (
          <StarIcon
            key={i}
            size={PX[size]}
            filled={i < shown}
            className={i < shown ? "text-highlight" : "text-border-strong"}
          />
        ))}
      </span>
    );
  }

  return (
    <div className={`inline-flex gap-1 ${className}`} role="radiogroup" aria-label="Puntuación">
      {Array.from({ length: maxStars }).map((_, i) => {
        const value = i + 1;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={value === Math.round(rating)}
            aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onRate?.(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(null)}
            className="rounded p-0.5"
          >
            <StarIcon
              size={PX[size]}
              filled={value <= shown}
              className={value <= shown ? "text-highlight" : "text-border-strong"}
            />
          </button>
        );
      })}
    </div>
  );
}
