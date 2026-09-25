"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { recommendationsRepository, type RecommendationKind } from "@/lib/recommendations/recommendations-repository";
import { ProductImage } from "@/components/ui/product-image";

interface RecommendationsCarouselProps {
  title: string;
  description?: string;
  kind: RecommendationKind;
  productId?: string;
  limit?: number;
}

export function RecommendationsCarousel({ title, description, kind, productId, limit = 8 }: RecommendationsCarouselProps) {
  const { user, loading: authLoading } = useAuth();

  // Las recomendaciones son un extra: si fallan o no hay ninguna, la sección simplemente no aparece.
  const needsUser = kind === "personalized";
  const { data: products } = useAsync(() => recommendationsRepository.load(kind, limit, productId), [kind, limit, productId, user?.id], {
    enabled: needsUser ? Boolean(user) && !authLoading : true,
  });

  if (!products || products.length === 0) return null;

  return (
    <section aria-labelledby={`rec-${kind}`} className="space-y-4">
      <div>
        <h2 id={`rec-${kind}`} className="text-heading">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>

      <ul className="-mx-[var(--spacing-gutter)] flex snap-x gap-4 overflow-x-auto px-[var(--spacing-gutter)] pb-3">
        {products.map((p) => (
          <li key={p.id} className="w-56 shrink-0 snap-start">
            <Link href={`/productos/${p.id}`} className="card group block overflow-hidden">
              <div className="relative aspect-[4/3] bg-surface-muted">
                <ProductImage src={p.imagen_url} sizes="224px" iconSize={32} />
                <span className="price-tag absolute bottom-2 left-2 !text-base">{formatPrice(p.precio)}</span>
              </div>
              <p className="line-clamp-2 p-3 text-sm font-medium group-hover:text-action">{p.nombre}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
