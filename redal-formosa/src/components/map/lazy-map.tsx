"use client";

import dynamic from "next/dynamic";

// Leaflet solo existe en el navegador y pesa ~150 KB: se carga únicamente donde hay mapa.
export const EmprendimientosMap = dynamic(() => import("./emprendimientos-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-muted" aria-hidden="true" />,
});
