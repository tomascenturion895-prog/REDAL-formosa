"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { recommendationsService, type RecommendedProduct } from "@/lib/recommendations/recommendations-service";

interface RecommendationsCarouselProps {
  title: string;
  userId?: string | null;
  type?: "personalized" | "trending" | "new" | "similar";
  productId?: string;
  limit?: number;
}

export function RecommendationsCarousel({
  title,
  userId = null,
  type = "trending",
  productId,
  limit = 8,
}: RecommendationsCarouselProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    loadRecommendations();
  }, [userId, type, productId]);

  const loadRecommendations = async () => {
    try {
      let data: any[] = [];

      switch (type) {
        case "personalized":
          data = await recommendationsService.getPersonalizedRecommendations(userId, limit);
          break;
        case "trending":
          data = await recommendationsService.getTrendingProducts(limit);
          break;
        case "new":
          data = await recommendationsService.getNewProducts(limit);
          break;
        case "similar":
          if (productId) {
            data = await recommendationsService.getSimilarProducts(productId, limit);
          }
          break;
      }

      setProducts(data);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`carousel-${type}`);
    if (container) {
      const scrollAmount = 320;
      const newPos =
        direction === "left"
          ? Math.max(0, scrollPos - scrollAmount)
          : scrollPos + scrollAmount;
      container.scrollLeft = newPos;
      setScrollPos(newPos);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="rounded-control border border-border bg-surface p-2 hover:bg-surface-muted transition-colors disabled:opacity-50"
            disabled={scrollPos === 0}
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-control border border-border bg-surface p-2 hover:bg-surface-muted transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div
        id={`carousel-${type}`}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {products.map((product) => (
          <Link
            key={product.producto_id}
            href={`/productos/${product.producto_id}`}
            className="flex-shrink-0 w-72 group rounded-card border border-border bg-surface overflow-hidden hover:shadow-lg transition-shadow"
          >
            {product.imagen_principal && (
              <img
                src={product.imagen_principal}
                alt={product.nombre}
                className="w-full h-40 object-cover bg-surface-muted group-hover:opacity-90 transition-opacity"
              />
            )}
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-foreground group-hover:text-action transition-colors line-clamp-2">
                {product.nombre}
              </h3>
              <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-action">
                  ${product.precio.toFixed(2)}
                </p>
                {product.relevancia && (
                  <span className="text-xs text-muted bg-surface-muted px-2 py-1 rounded">
                    {Math.round(product.relevancia * 100 / 10)}% match
                  </span>
                )}
              </div>
              {product.razon && (
                <p className="text-xs text-muted italic">
                  {product.razon === "basado_en_favoritos"
                    ? "Basado en tus favoritos"
                    : "Basado en tus compras"}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
