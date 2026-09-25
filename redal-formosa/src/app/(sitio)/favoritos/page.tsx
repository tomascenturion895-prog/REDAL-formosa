"use client";

import { useState } from "react";
import Link from "next/link";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { useAsync } from "@/lib/hooks/use-async";
import { wishlistRepository } from "@/lib/wishlist/wishlist-repository";
import { PageHeader } from "@/components/layout/page-header";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { HeartIcon } from "@/components/ui/icons";

export default function FavoritosPage() {
  const { user, pending } = useRequireAuth();
  const { data, error, loading } = useAsync(() => wishlistRepository.listProducts(user!.id), [user?.id], {
    enabled: Boolean(user),
  });
  // Los que la persona quita en esta pantalla desaparecen de la lista sin recargar.
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  if (pending || loading) return <div className="page-container py-section" aria-busy="true" />;

  const products = (data ?? []).filter((p) => !removed.has(p.id));

  return (
    <div className="page-container py-section">
      <PageHeader
        title="Favoritos"
        description={products.length ? `${products.length} ${products.length === 1 ? "producto guardado" : "productos guardados"}` : undefined}
      />

      {error ? (
        <Alert tone="error">No pudimos cargar tus favoritos.</Alert>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<HeartIcon size={36} />}
          title="Todavía no guardaste favoritos"
          description="Tocá el corazón en cualquier producto para guardarlo y encontrarlo rápido."
          action={
            <Link href="/productos" className="btn btn-primary">
              Explorar productos
            </Link>
          }
        />
      ) : (
        <ProductGrid
          products={products}
          onFavoriteChange={(productId, isFavorite) => {
            if (!isFavorite) setRemoved((prev) => new Set(prev).add(productId));
          }}
        />
      )}
    </div>
  );
}
