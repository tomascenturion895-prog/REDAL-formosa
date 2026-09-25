"use client";

import { useState } from "react";
import Link from "next/link";

import { useCart, type CartProduct } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { CheckIcon, PlusIcon, StarIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";

export interface ProductCardData extends CartProduct {
  descripcion?: string | null;
  disponible?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  emprendimientoNombre?: string;
  rating?: { promedio: number; total: number } | null;
  favorite?: boolean;
  onFavoriteChange?: (productId: string, isFavorite: boolean) => void;
}

export function ProductCard({ product, emprendimientoNombre, rating, favorite, onFavoriteChange }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const available = product.disponible !== false;

  const handleAdd = () => {
    if (addItem(product, 1)) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  return (
    <article className="card group flex flex-col overflow-hidden">
      <div className="relative">
        <Link href={`/productos/${product.id}`} className="block" tabIndex={-1} aria-hidden="true">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            <ProductImage
              src={product.imagen_url}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              iconSize={40}
            />
          </div>
        </Link>

        <div className="absolute right-2.5 top-2.5">
          <WishlistButton
            productId={product.id}
            favorite={favorite}
            onToggle={(v) => onFavoriteChange?.(product.id, v)}
          />
        </div>

        <div className="absolute bottom-2.5 left-2.5">
          <span className="price-tag">{formatPrice(product.precio)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-base font-semibold leading-snug">
          <Link href={`/productos/${product.id}`} className="hover:text-action">
            {product.nombre}
          </Link>
        </h3>

        <p className="text-sm text-muted">
          {product.unidad}
          {emprendimientoNombre ? ` de ${emprendimientoNombre}` : ""}
        </p>

        {rating && rating.total > 0 && (
          <p className="flex items-center gap-1 text-sm text-muted">
            <StarIcon size={14} filled className="text-highlight" />
            <span className="font-medium text-foreground">{rating.promedio.toFixed(1)}</span>
            <span>({rating.total})</span>
          </p>
        )}

        <div className="mt-auto pt-3">
          {available ? (
            <button
              type="button"
              onClick={handleAdd}
              className={`btn btn-sm w-full ${added ? "btn-secondary" : "btn-primary"}`}
              aria-live="polite"
            >
              {added ? (
                <>
                  <CheckIcon size={16} /> Agregado
                </>
              ) : (
                <>
                  <PlusIcon size={16} /> Agregar al carrito
                </>
              )}
            </button>
          ) : (
            <p className="rounded-control bg-surface-muted px-3 py-1.5 text-center text-sm text-muted">
              Sin stock por ahora
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
