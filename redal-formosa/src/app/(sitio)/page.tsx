import Link from "next/link";

import { HeroSearch } from "@/components/home/hero-search";
import { HomeMapPreview } from "@/components/home/home-map-preview";
import { NewestProducts } from "@/components/home/newest-products";
import { ProducerFeed } from "@/components/producer/ProducerFeed";
import { RecommendationsCarousel } from "@/components/recommendations/recommendations-carousel";
import { MapPinIcon, ShieldIcon, StoreIcon, TruckIcon } from "@/components/ui/icons";

export default function Home() {
  return (
    <>
      <section className="bg-organic border-b border-border">
        <div className="page-container grid items-center gap-12 py-section lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-sm font-medium text-success">
              <MapPinIcon size={16} />
              Hecho en Formosa
            </p>
            <h1 className="text-display">
              Elegí lo nuestro.
              <br />
              <span className="italic text-action">Apostá por Formosa.</span>
            </h1>
            <p className="mb-8 mt-5 max-w-lg text-lg text-muted">
              Productos frescos, elaboraciones artesanales y servicios de emprendedores formoseños. Sin intermediarios y a kilómetros de vos.
            </p>
            <HeroSearch />
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
              {[
                { icon: <StoreIcon size={18} />, label: "Directo del productor" },
                { icon: <TruckIcon size={18} />, label: "Entrega local" },
                { icon: <ShieldIcon size={18} />, label: "Pago seguro con Mercado Pago" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className="text-action">{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-3 -z-10 rotate-2 rounded-sheet bg-highlight/25 sm:-inset-4"
              aria-hidden="true"
            />
            <div className="relative isolate h-[22rem] overflow-hidden rounded-sheet border border-border shadow-pop sm:h-[26rem] lg:h-[30rem]">
              <HomeMapPreview />
            </div>
          </div>
        </div>
      </section>

      <div className="page-container space-y-14 py-section">
        <ProducerFeed />

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

        <section className="grid gap-6 rounded-sheet bg-ink-900 p-8 text-neutral-50 shadow-pop sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
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
