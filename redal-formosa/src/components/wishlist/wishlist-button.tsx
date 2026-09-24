"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { wishlistService } from "@/lib/wishlist/wishlist-service";

interface WishlistButtonProps {
  productId: string;
  onToggle?: (isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({ productId, onToggle, size = "md" }: WishlistButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFavorite();
  }, [user, productId]);

  const checkFavorite = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const isFav = await wishlistService.isInWishlist(user.id, productId);
      setIsFavorite(isFav);
    } catch (err) {
      console.error("Error checking favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await wishlistService.removeFromWishlist(user.id, productId);
        setIsFavorite(false);
        onToggle?.(false);
      } else {
        await wishlistService.addToWishlist(user.id, productId);
        setIsFavorite(true);
        onToggle?.(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-3",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        rounded-control border transition-all
        ${isFavorite
          ? "bg-highlight border-highlight text-on-highlight"
          : "border-border bg-surface text-foreground hover:border-highlight"
        }
        font-medium disabled:opacity-60
        ${sizeClasses[size]}
      `}
    >
      <span className="mr-2">{isFavorite ? "❤️" : "🤍"}</span>
      {isFavorite ? "Favorito" : "Agregar"}
    </button>
  );
}
