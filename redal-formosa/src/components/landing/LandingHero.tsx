"use client";

import React, { useState } from "react";
import Link from "next/link";


export default function LandingHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("productos");

  const chips = [
    { id: "productos", label: "Productos" },
    { id: "servicios", label: "Servicios" },
    { id: "emprendimientos", label: "Emprendimientos" },
    { id: "productores", label: "Productores" },
    { id: "b2b", label: "Canal B2B" },
  ];

  const categories = [
    {
      name: "Alimentos & Chacra",
      count: "340+ productos",
      icon: "🥦",
      href: "/productor/chacra-la-esperanza",
      color: "#17924E",
    },
    {
      name: "Gastronomía Autóctona",
      count: "270+ recetas",
      icon: "🍯",
      href: "/productor/chacra-la-esperanza",
      color: "#F0A417",
    },
    {
      name: "Artesanías & Fibras",
      count: "190+ creaciones",
      icon: "🧺",
      href: "/productor/chacra-la-esperanza",
      color: "#2FA8DE",
    },
    {
      name: "Comercio & B2B",
      count: "80+ acuerdos",
      icon: "📦",
      href: "/b2b",
      color: "#0B2545",
    },
  ];

  return (
    <div className="w-full bg-[#FAF7F1] text-[#0B2545] font-sans pb-16">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* ========================================================
            1. HERO CONTENT NEATLY INTEGRATED AT THE TOP
            ======================================================== */}
        <section className="flex flex-col items-center justify-center mb-10 sm:mb-14 max-w-4xl mx-auto text-center">
          
          {/* Headlines & Search */}
          <div className="w-full space-y-8 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1F2E8] text-[#0E7A3F] border border-[#17924E]/20 text-xs font-bold tracking-wide">
              <span>REDAL Formosa</span>
              <span>•</span>
              <span>Red de Abastecimiento Local</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-[#0B2545] tracking-tight leading-[1.08]">
              Elegí lo nuestro. <br />
              Apostá por{" "}
              <span className="relative inline-block text-[#17924E]">
                Formosa.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#17924E]"
                  viewBox="0 0 220 14"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M4 10 C 60 2 150 2 216 8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#44576B] max-w-xl leading-relaxed">
              Descubrí productos agroecológicos frescos, elaboraciones artesanales y servicios de
              emprendedores formoseños. Sin intermediarios abusivos y a kilómetros de vos.
            </p>

            {/* Integrated Search Box */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8E2D5] shadow-lg shadow-[#0B2545]/5">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-2 bg-[#FAF7F1] rounded-xl px-3.5 py-2 border border-[#E8E2D5]"
              >
                <svg
                  className="w-5 h-5 text-[#44576B] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="¿Qué estás buscando? Ej: Miel, mandioca, verduras, cestería..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base text-[#0B2545] placeholder-[#7C8B9B] outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#0B2545] hover:bg-[#123657] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Buscar
                </button>
              </form>

              {/* Chips under Search */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-[#E8E2D5]/70">
                <span className="text-[11px] font-bold text-[#7C8B9B] uppercase tracking-wider mr-1">
                  Filtrar por:
                </span>
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveChip(chip.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      activeChip === chip.id
                        ? "bg-[#17924E] text-white shadow-xs"
                        : "bg-[#F3EEE3] text-[#44576B] hover:bg-[#E8E2D5] hover:text-[#0B2545]"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/productor/chacra-la-esperanza"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#17924E] hover:bg-[#0E7A3F] text-white font-bold text-sm shadow-md shadow-[#17924E]/25 transition-transform hover:-translate-y-0.5"
              >
                <span>Explorar Catálogo Productor</span>
                <span>→</span>
              </Link>
              <Link
                href="/b2b"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B2545] hover:bg-[#123657] text-white font-bold text-sm shadow-md shadow-[#0B2545]/20 transition-transform hover:-translate-y-0.5"
              >
                <span>Canal Mayorista & B2B</span>
                <span className="bg-[#2FA8DE] text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold">
                  Comercios
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
