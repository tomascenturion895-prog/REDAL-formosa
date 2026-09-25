"use client";

import dynamic from "next/dynamic";

const HeroMap = dynamic(() => import("@/components/landing/HeroMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl bg-[#F3EEE3] border border-[#E8E2D5] flex flex-col items-center justify-center gap-3 text-[#44576B] animate-pulse">
      <div className="w-10 h-10 rounded-full border-3 border-[#17924E] border-t-transparent animate-spin" />
      <span className="text-sm font-semibold">Cargando mapa territorial de Formosa...</span>
    </div>
  ),
});

export default function MapaPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F1] flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E2D5] text-xs font-semibold text-[#0B2545] shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#17924E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#17924E]"></span>
              </span>
              <span>Mapa Georeferenciado en Tiempo Real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#0B2545] mt-2 tracking-tight">
              Punto Focal Territorial: Lo que se produce en Formosa
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#44576B] bg-white px-3 py-1.5 rounded-lg border border-[#E8E2D5]">
              📍 Filtra y haz clic en los pines para contactar directamente
            </span>
          </div>
        </div>
        
        <div className="flex-1 w-full relative min-h-[600px] rounded-2xl overflow-hidden shadow-lg border border-[#E8E2D5]">
          <HeroMap />
        </div>
      </main>
    </div>
  );
}
