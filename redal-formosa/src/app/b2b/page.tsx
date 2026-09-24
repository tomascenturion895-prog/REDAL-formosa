import type { Metadata } from "next";
import Link from "next/link";
import { B2BHero } from "@/components/b2b/B2BHero";
import { B2BBenefits } from "@/components/b2b/B2BBenefits";
import { B2BCatalogSection } from "@/components/b2b/B2BCatalogSection";
import { B2BRfqForm } from "@/components/b2b/B2BRfqForm";

export const metadata: Metadata = {
  title: "Canal B2B & Abastecimiento Mayorista | REDAL Formosa",
  description:
    "Comprá por bulto y cajón cerrado directo de chacras de Formosa para restaurantes, verdulerías y supermercados.",
};

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
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
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Portal B2B & Mayoristas
            </span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Hero Commercial Section */}
        <B2BHero />

        {/* 2. Commercial Pillars / Benefits */}
        <B2BBenefits />

        {/* 3. Featured Bulk Deals / Wholesaler Catalog */}
        <B2BCatalogSection />

        {/* 4. RFQ / Quotation Form */}
        <B2BRfqForm />

        {/* 5. Navigation banner to Producer Catalog */}
        <div className="rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 text-center">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            ¿Preferís conocer a cada productor individualmente?
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            Podés recorrer las chacras asociadas a REDAL, conocer sus parcelas de cultivo y hacer
            pedidos directos a su puesto de feria.
          </p>
          <div className="mt-4">
            <Link
              href="/productor/chacra-la-esperanza"
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-zinc-50 shadow-sm"
            >
              Ver perfil de Chacra La Esperanza
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
