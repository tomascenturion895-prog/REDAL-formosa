import Link from "next/link";

import { HeroSearch } from "@/components/home/hero-search";
import { HomeMapPreview } from "@/components/home/home-map-preview";
import { NewestProducts } from "@/components/home/newest-products";
import { RecommendationsCarousel } from "@/components/recommendations/recommendations-carousel";

export default function Home() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="page-container grid items-center gap-10 py-section lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h1 className="text-display">
              Elegí lo nuestro.
              <br />
              Apostá por Formosa.
            </h1>
            <p className="mb-8 mt-5 max-w-lg text-lg text-muted">
              Productos frescos, elaboraciones artesanales y servicios de emprendedores formoseños. Sin intermediarios y a kilómetros de vos.
            </p>
            <HeroSearch />
          </div>

          <div className="relative isolate h-[22rem] overflow-hidden rounded-sheet border border-border shadow-card sm:h-[26rem] lg:h-[30rem]">
            <HomeMapPreview />
          </div>
        </div>
      </section>

      <div className="page-container space-y-14 py-section">
        <RecommendationsCarousel kind="personalized" title="Elegidos para vos" description="Según tus favoritos y tus compras." />

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

        <section className="grid gap-6 rounded-sheet bg-ink-900 p-8 text-neutral-50 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div>
            <h2 className="text-title">¿Producís algo en Formosa?</h2>
            <p className="mt-2 max-w-lg text-ink-200">
              Publicá tus productos, aparecé en el mapa y cobrá con MercadoPago. Nosotros nos ocupamos de que te encuentren.
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
