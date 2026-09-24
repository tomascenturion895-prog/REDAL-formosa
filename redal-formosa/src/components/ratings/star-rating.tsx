"use client";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRate,
  className = "",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  const displayRating = Math.min(Math.max(rating, 0), maxStars);
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const isFull = i < fullStars;
        const isHalf = i === fullStars && hasHalfStar;

        return (
          <button
            key={i}
            onClick={() => interactive && onRate?.(i + 1)}
            disabled={!interactive}
            className={`${sizeClasses[size]} transition-colors ${
              interactive ? "cursor-pointer hover:opacity-70" : "cursor-default"
            }`}
          >
            {isFull ? (
              <span className="text-highlight">★</span>
            ) : isHalf ? (
              <span className="text-highlight">◆</span>
            ) : (
              <span className="text-muted">☆</span>
            )}
          </button>
        );
      })}
      <span className={`ml-2 font-medium text-foreground ${sizeClasses[size]}`}>
        {displayRating.toFixed(1)}
      </span>
    </div>
  );
}
