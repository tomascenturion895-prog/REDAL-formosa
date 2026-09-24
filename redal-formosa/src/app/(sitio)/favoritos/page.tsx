"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { wishlistService, type WishlistItem } from "@/lib/wishlist/wishlist-service";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

export default function FavoritosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    loadFavorites();
  }, [user, authLoading]);

  const loadFavorites = async () => {
    try {
      const data = await wishlistService.getWishlist(user!.id);
      setFavorites(data);
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId: string) => {
    setFavorites(favorites.filter((f) => f.producto_id !== productId));
  };

  if (authLoading || loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">❤️ Mis Favoritos</h1>
        <p className="text-muted">{favorites.length} productos guardados</p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-card border border-border bg-surface-muted p-12 text-center space-y-4">
          <p className="text-lg text-muted">Aún no tienes favoritos</p>
          <Link
            href="/productos"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="rounded-card border border-border bg-surface overflow-hidden hover:shadow-lg transition-shadow"
            >
              {item.producto?.imagen_principal && (
                <img
                  src={item.producto.imagen_principal}
                  alt={item.producto.nombre}
                  className="w-full h-48 object-cover bg-surface-muted"
                />
              )}

              <div className="p-4 space-y-3">
                <Link href={`/productos/${item.producto_id}`}>
                  <h3 className="font-semibold text-foreground hover:text-action transition-colors line-clamp-2">
                    {item.producto?.nombre}
                  </h3>
                </Link>

                <p className="text-lg font-bold text-action">
                  ${item.producto?.precio.toFixed(2)}
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/productos/${item.producto_id}`}
                    className="flex-1 text-center rounded-control bg-surface-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
                  >
                    Ver
                  </Link>
                  <WishlistButton
                    productId={item.producto_id}
                    onToggle={(isFav) => {
                      if (!isFav) handleRemove(item.producto_id);
                    }}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
