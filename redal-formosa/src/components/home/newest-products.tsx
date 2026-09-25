"use client";

import Link from "next/link";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { useAsync } from "@/lib/hooks/use-async";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreIcon } from "@/components/ui/icons";

const HOME_PRODUCTS = 8;

async function loadNewest() {
  const products = (await catalogRepository.searchProducts({ query: "" })).slice(0, HOME_PRODUCTS);
  const names = await catalogRepository.getEmprendimientoNames(products.map((p) => p.emprendimiento_id));
  return { products, names };
}

export function NewestProducts() {
  const { data, error, loading } = useAsync(loadNewest, []);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card aspect-[3/4] animate-pulse bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (error || !data || data.products.length === 0) {
    return (
      <EmptyState
        icon={<StoreIcon size={36} />}
        title="Estamos sumando emprendedores"
        description="Los primeros productos aparecen acá apenas se publiquen. ¿Producís algo? Sumate."
        action={
          <Link href="/register?next=/setup" className="btn btn-primary">
            Publicar mi emprendimiento
          </Link>
        }
      />
    );
  }

  return <ProductGrid products={data.products} emprendimientoNombres={data.names} />;
}
