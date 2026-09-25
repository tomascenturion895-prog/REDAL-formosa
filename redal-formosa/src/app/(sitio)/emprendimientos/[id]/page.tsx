"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { useAsync } from "@/lib/hooks/use-async";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ContactActions, ContactBar } from "@/components/contact/contact-actions";
import { RecipesDialog } from "@/components/recipes/recipes-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPinIcon, PackageIcon, StoreIcon } from "@/components/ui/icons";

async function loadStore(id: string) {
  const [emprendimiento, productos] = await Promise.all([
    catalogRepository.getEmprendimiento(id),
    catalogRepository.listAvailableProducts(id),
  ]);
  const ratings = await catalogRepository.getRatingSummaries(productos.map((p) => p.id));
  return { emprendimiento, productos, ratings };
}

export default function EmprendimientoPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useAsync(() => loadStore(id), [id]);

  if (loading) return <div className="page-container py-section" aria-busy="true" />;

  const emprendimiento = data?.emprendimiento;
  if (!emprendimiento) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<StoreIcon size={36} />}
          title="No encontramos este emprendimiento"
          action={
            <Link href="/emprendimientos" className="btn btn-primary">
              Ver emprendimientos
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <nav aria-label="Ubicación" className="mb-6 text-sm text-muted">
        <Link href="/emprendimientos" className="hover:text-foreground">
          Emprendimientos
        </Link>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-primary-100 font-display text-3xl font-bold text-primary-800">
            {emprendimiento.nombre.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-title">{emprendimiento.nombre}</h1>
            {emprendimiento.descripcion && <p className="mt-2 max-w-prose text-muted">{emprendimiento.descripcion}</p>}
            {emprendimiento.direccion && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                <MapPinIcon size={16} />
                {emprendimiento.direccion}
              </p>
            )}
          </div>
        </div>

        {(emprendimiento.email || emprendimiento.telefono) && (
          <ContactBar>
            {emprendimiento.email && (
              <a href={`mailto:${emprendimiento.email}`} className="btn btn-secondary">
                Escribirles
              </a>
            )}
            <ContactActions
              telefono={emprendimiento.telefono}
              mensaje={`Hola, vi tu emprendimiento ${emprendimiento.nombre} en RedAL Formosa y quería consultarte.`}
            />
          </ContactBar>
        )}
      </header>

      <section aria-labelledby="prods" className="pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
          <h2 id="prods" className="text-heading">
            Productos ({data.productos.length})
          </h2>
          {data.productos.length > 0 && <RecipesDialog emprendimientoId={id} />}
        </div>
        {data.productos.length === 0 ? (
          <EmptyState
            icon={<PackageIcon size={36} />}
            title="Todavía no tiene productos publicados"
            description="Volvé pronto o mirá otros emprendimientos."
          />
        ) : (
          <ProductGrid products={data.productos} ratings={data.ratings} />
        )}
      </section>
    </div>
  );
}
