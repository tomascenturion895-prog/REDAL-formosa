import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProducerHero } from "@/components/producer/ProducerHero";
import { ProducerBio } from "@/components/producer/ProducerBio";
import { ProductCatalog } from "@/components/producer/ProductCatalog";
import { DeliveryInfoSection } from "@/components/producer/DeliveryInfoSection";

interface ProducerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProducerPageProps): Promise<Metadata> {
  const { id } = await params;
  
  // TODO: Fetch from Supabase
  const producer: any = null;

  if (!producer) {
    return {
      title: "Productor | REDAL Formosa",
    };
  }

  return {
    title: `${producer.nombre} | Catálogo Oficial REDAL Formosa`,
    description: `${producer.descripcionCorta} - Ubicado en ${producer.ubicacion.localidad}, Formosa. Alimentos frescos directos del productor.`,
  };
}

export default async function ProducerPage({ params }: ProducerPageProps) {
  const { id } = await params;
  
  // TODO: Fetch from Supabase
  const producer: any = null;

  if (!producer) {
    // notFound();
    return <div className="p-10 text-center">Catálogo en construcción (Datos estáticos removidos)</div>;
  }

  const products: any[] = [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      {/* Breadcrumb Bar */}
      <div className="border-b border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
          >
            <Link
              href="/"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              <span>Inicio</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Productores</span>
            <span>/</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-xs">
              {producer.nombre}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Header / Hero Visual Section */}
        <ProducerHero producer={producer} />

        {/* 2. Story, Agricultural Practices & Fast Logistics */}
        <ProducerBio producer={producer} />

        {/* 3. Delivery Points & Ferias Francas */}
        <DeliveryInfoSection
          schedules={producer.puntosEntrega}
          localidad={producer.ubicacion.localidad}
        />

        {/* 4. Interactive Product Catalog (Products Grid + Filters + Order Drawer) */}
        <ProductCatalog products={products} producer={producer} />

        {/* 5. B2B / Wholesale Notice Banner */}
        {producer.aceptaB2B && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-block rounded-full bg-amber-400/90 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 mb-1">
                Atención Comercios & Restaurantes
              </span>
              <h3 className="text-xl font-bold">
                ¿Buscás abastecer tu verdulería o local gastronómico con {producer.nombre}?
              </h3>
              <p className="text-xs text-emerald-200 max-w-xl">
                Accedé a listas de precios por bulto cerrado (cajones de 18-20kg y bolsas de 30kg)
                con entrega programada en Formosa Capital y localidades aledañas.
              </p>
            </div>
            <Link
              href="/b2b"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 px-5 py-3 text-xs font-black shadow-md transition-all hover:scale-105"
            >
              Explorar Canal B2B
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
