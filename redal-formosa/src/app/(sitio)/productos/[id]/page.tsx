"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { useCart } from "@/lib/cart/cart-context";
import { MAX_QUANTITY } from "@/lib/cart/cart-reducer";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { ratingsRepository } from "@/lib/ratings/ratings-repository";
import { StarRating } from "@/components/ratings/star-rating";
import { RatingForm } from "@/components/ratings/rating-form";
import { RatingsList } from "@/components/ratings/ratings-list";
import { WhatsAppButton } from "@/components/contact/whatsapp-button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { RecommendationsCarousel } from "@/components/recommendations/recommendations-carousel";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon, MinusIcon, PackageIcon, PlusIcon, StoreIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";

export default function ProductoDetailPage() {
  const { id: productoId } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const { data: producto, loading } = useAsync(() => catalogRepository.getProduct(productoId), [productoId]);
  const { data: stats, reload: reloadStats } = useAsync(() => ratingsRepository.statsForProduct(productoId), [productoId]);

  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);
  const [ratingsVersion, setRatingsVersion] = useState(0);

  if (loading) {
    return (
      <div className="page-container py-section">
        <div className="grid animate-pulse gap-10 lg:grid-cols-2" aria-hidden="true">
          <div className="aspect-square rounded-card bg-surface-muted" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 rounded bg-surface-muted" />
            <div className="h-6 w-1/4 rounded bg-surface-muted" />
            <div className="h-24 rounded bg-surface-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<PackageIcon size={36} />}
          title="No encontramos este producto"
          description="Puede que ya no esté publicado."
          action={
            <Link href="/productos" className="btn btn-primary">
              Ver todos los productos
            </Link>
          }
        />
      </div>
    );
  }

  const handleAdd = () => {
    if (addItem(producto, cantidad)) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="page-container py-section">
      <nav aria-label="Ubicación" className="mb-6 text-sm text-muted">
        <Link href="/productos" className="hover:text-foreground">
          Productos
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{producto.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="card overflow-hidden">
          <div className="relative aspect-square bg-surface-muted">
            <ProductImage src={producto.imagen_url} alt={producto.nombre} sizes="(min-width: 1024px) 55vw, 100vw" priority iconSize={72} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-title">{producto.nombre}</h1>

            {producto.emprendimiento && (
              <Link
                href={`/emprendimientos/${producto.emprendimiento.id}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-link hover:underline"
              >
                <StoreIcon size={16} />
                {producto.emprendimiento.nombre}
              </Link>
            )}

            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              {stats && stats.total > 0 ? (
                <>
                  <StarRating rating={stats.promedio} size="sm" />
                  <span>
                    {stats.promedio.toFixed(1)} · {stats.total} {stats.total === 1 ? "calificación" : "calificaciones"}
                  </span>
                </>
              ) : (
                <span>Todavía sin calificaciones</span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="price-tag !text-2xl">{formatPrice(producto.precio)}</span>
            <span className="text-sm text-muted">{producto.unidad}</span>
          </div>

          {producto.descripcion && <p className="max-w-prose">{producto.descripcion}</p>}

          <div className="card space-y-4 p-5">
            {producto.disponible ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium" id="qty-label">
                    Cantidad
                  </span>
                  <div className="flex items-center gap-1" role="group" aria-labelledby="qty-label">
                    <button type="button" className="btn btn-secondary !p-2" onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Restar una unidad">
                      <MinusIcon size={16} />
                    </button>
                    <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">
                      {cantidad}
                    </span>
                    <button type="button" className="btn btn-secondary !p-2" onClick={() => setCantidad((c) => Math.min(MAX_QUANTITY, c + 1))} aria-label="Sumar una unidad">
                      <PlusIcon size={16} />
                    </button>
                  </div>
                </div>

                <button type="button" onClick={handleAdd} className="btn btn-primary w-full !py-3">
                  {added ? (
                    <>
                      <CheckIcon size={18} /> Agregado al carrito
                    </>
                  ) : (
                    <>Agregar al carrito · {formatPrice(Number(producto.precio) * cantidad)}</>
                  )}
                </button>

                {added && (
                  <Link href="/carrito" className="block text-center text-sm font-medium text-link hover:underline">
                    Ir al carrito
                  </Link>
                )}
              </>
            ) : (
              <p className="rounded-control bg-surface-muted px-4 py-3 text-center text-sm text-muted">Este producto no está disponible por ahora.</p>
            )}

            <WishlistButton productId={producto.id} variant="full" />

            <WhatsAppButton
              telefono={producto.emprendimiento?.telefono}
              mensaje={`Hola, vi ${producto.nombre} en RedAL Formosa y quería consultarte.`}
              label="Consultar por este producto"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="ratings-title" className="space-y-4">
          <h2 id="ratings-title" className="text-heading">
            Calificaciones
          </h2>
          <RatingsList key={ratingsVersion} productoId={productoId} limit={20} />
        </section>

        <section aria-labelledby="rate-title" className="card h-fit space-y-4 p-5">
          <h2 id="rate-title" className="text-heading">
            Calificá este producto
          </h2>
          <RatingForm
            productoId={productoId}
            onSuccess={() => {
              reloadStats();
              setRatingsVersion((v) => v + 1);
            }}
          />
        </section>
      </div>

      <div className="mt-16">
        <RecommendationsCarousel kind="similar" productId={productoId} title="Más como este" limit={6} />
      </div>
    </div>
  );
}
