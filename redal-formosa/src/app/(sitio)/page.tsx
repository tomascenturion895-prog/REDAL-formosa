import Link from "next/link";

import { NewestProducts } from "@/components/home/newest-products";
import { RecommendationsCarousel } from "@/components/recommendations/recommendations-carousel";
import { SearchIcon } from "@/components/ui/icons";

const QUICK_SEARCHES = ["Miel", "Mandioca", "Chipá", "Dulces", "Artesanías"];

export default function Home() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="page-container py-section">
          <h1 className="text-display max-w-3xl">Lo que se produce en Formosa, cerca tuyo</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Comprale directo a emprendedores y productores locales, y recibilo en tu casa.
          </p>

          <form action="/productos" method="get" role="search" className="mt-8 flex max-w-2xl gap-3">
            <div className="relative flex-1">
              <label htmlFor="home-search" className="sr-only">
                Buscar productos
              </label>
              <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="¿Qué querés comprar hoy?"
                className="field !rounded-full !py-3.5 !pl-12 text-base"
              />
            </div>
            <button type="submit" className="btn btn-primary !rounded-full !px-6">
              Buscar
            </button>
          </form>

          <ul className="mt-5 flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((term) => (
              <li key={term}>
                <Link href={`/productos?q=${encodeURIComponent(term)}`} className="chip">
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="page-container space-y-14 py-section">
        <RecommendationsCarousel
          kind="personalized"
          title="Elegidos para vos"
          description="Según tus favoritos y tus compras."
        />

        <section aria-labelledby="newest" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <h2 id="newest" className="text-heading">
              Recién llegados
            </h2>
            <Link href="/productos" className="text-sm font-medium text-link hover:underline">
              Ver todos los productos
            </Link>
          </div>
          <NewestProducts />
        </section>

        <RecommendationsCarousel kind="bestsellers" title="Lo más pedido" />

        <section className="card grid gap-6 bg-primary-900 p-8 text-primary-50 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10 dark:bg-surface-muted">
          <div>
            <h2 className="text-title">¿Producís algo en Formosa?</h2>
            <p className="mt-2 max-w-lg text-primary-200">
              Publicá tus productos, recibí pedidos y cobrá con MercadoPago. Nosotros nos ocupamos de que te encuentren.
            </p>
          </div>
          <Link href="/register" className="btn btn-accent">
            Sumá tu emprendimiento
          </Link>
        </section>
      </div>
    </>
  );
}
