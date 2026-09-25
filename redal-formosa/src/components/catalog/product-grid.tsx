"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useUserScopedState } from "@/lib/auth/use-user-scoped-state";
import { useAsync } from "@/lib/hooks/use-async";
import type { RatingSummary } from "@/lib/catalog/catalog-repository";
import { wishlistRepository } from "@/lib/wishlist/wishlist-repository";
import { ProductCard, type ProductCardData } from "./product-card";

interface ProductGridProps {
  products: ProductCardData[];
  emprendimientoNombres?: Record<string, string>;
  ratings?: Record<string, RatingSummary>;
  /** Llamado cuando cambia un favorito (la página de favoritos lo usa para sacarlo de la lista). */
  onFavoriteChange?: (productId: string, isFavorite: boolean) => void;
}

export function ProductGrid({ products, emprendimientoNombres, ratings, onFavoriteChange }: ProductGridProps) {
  const { user } = useAuth();
  // Una sola consulta para toda la grilla; los cambios de la persona se superponen al resultado.
  const { data: saved } = useAsync(() => wishlistRepository.favoriteIds(user!.id), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });
  const [changes, setChanges] = useUserScopedState<Record<string, boolean>>(() => ({}));

  const handleChange = (productId: string, isFavorite: boolean) => {
    setChanges((prev) => ({ ...prev, [productId]: isFavorite }));
    onFavoriteChange?.(productId, isFavorite);
  };

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.id} className="contents">
          <ProductCard
            product={product}
            emprendimientoNombre={emprendimientoNombres?.[product.emprendimiento_id]}
            rating={ratings?.[product.id]}
            favorite={changes[product.id] ?? saved?.has(product.id) ?? false}
            onFavoriteChange={handleChange}
          />
        </li>
      ))}
    </ul>
  );
}
