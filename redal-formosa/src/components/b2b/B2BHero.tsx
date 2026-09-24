import React from "react";
import { Button } from "@/components/ui/Button";

export function B2BHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-900 text-white border border-emerald-900/40 p-8 sm:p-12 lg:p-16 shadow-xl">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Canal Mayorista & Gastronomía
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">
            Provincia de Formosa
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Abastecé tu comercio directo de las{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300">
            chacras de Formosa
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
          Conectamos a verdulerías, rotiserías, restaurantes y hoteles con pequeños productores
          locales. Comprá por bulto cerrado (cajones de tomate, bolsas de mandioca, batata y miel)
          con precios mayoristas de origen y logística coordinada.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="amber"
            size="lg"
            href="#solicitar-cotizacion"
            icon={
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          >
            Solicitar Cotización por Volumen
          </Button>

          <Button
            variant="outline"
            size="lg"
            href="#ofertas-destacadas"
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
          >
            Ver Lotes Mayoristas
          </Button>
        </div>

        {/* Quick Highlights Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
          <div>
            <div className="text-2xl font-black text-emerald-400">Hasta 35%</div>
            <div className="text-xs text-zinc-400">Ahorro frente a intermediarios</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">24-48 hs</div>
            <div className="text-xs text-zinc-400">Cosecha directa a tu cocina</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-2xl font-black text-white">100% Local</div>
            <div className="text-xs text-zinc-400">Impulso a la economía formoseña</div>
          </div>
        </div>
      </div>
    </div>
  );
}
