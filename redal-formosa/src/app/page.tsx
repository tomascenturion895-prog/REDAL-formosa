import React from "react";
import LandingHero from "@/components/landing/LandingHero";

export const metadata = {
  title: "REDAL Formosa — Elegí lo nuestro | Red de Abastecimiento Local",
  description:
    "Descubrí productos agroecológicos, elaboraciones artesanales y servicios de emprendedores formoseños directamente en el mapa.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF7F1]">
      <LandingHero />
    </main>
  );
}
