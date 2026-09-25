"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface MapPlace {
  id: string;
  name: string;
  category: "alimentos" | "artesanias" | "gastronomia" | "b2b";
  categoryLabel: string;
  location: string;
  lat: number;
  lng: number;
  producer: string;
  slug?: string;
  highlight: string;
  price?: string;
}

const PLACES: MapPlace[] = [];

const CATEGORY_COLORS: Record<string, string> = {
  alimentos: "#17924E",
  gastronomia: "#F0A417",
  artesanias: "#2FA8DE",
  b2b: "#0B2545",
};

export default function HeroMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(PLACES[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Center around East/Central Formosa
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView([-25.85, -58.4], 8);

      mapInstanceRef.current = map;

      // OpenStreetMap base tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Render markers
      renderMarkers(L, map, PLACES);
      setIsLoaded(true);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const renderMarkers = (L: any, map: any, placesToRender: MapPlace[]) => {
    // Clear existing
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    placesToRender.forEach((place) => {
      const color = CATEGORY_COLORS[place.category] || "#17924E";

      const customIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="
            background: ${color};
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(11,37,69,0.3);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.05em; margin-bottom: 2px;">
            ${place.categoryLabel}
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #0B2545; line-height: 1.2; margin-bottom: 4px;">
            ${place.name}
          </div>
          <div style="font-size: 12px; color: #44576B; margin-bottom: 6px;">
            📍 ${place.location}
          </div>
          <div style="font-size: 11px; background: #FAF7F1; padding: 4px 8px; border-radius: 6px; border: 1px solid #E8E2D5; margin-bottom: 8px; font-weight: 500; color: #17924E;">
            ${place.highlight}
          </div>
          <a href="/productor/${place.slug || 'chacra-la-esperanza'}" style="
            display: inline-block;
            width: 100%;
            text-align: center;
            background: #0B2545;
            color: #ffffff;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 999px;
            text-decoration: none;
          ">Ver Catálogo & Contactar →</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("click", () => {
        setSelectedPlace(place);
      });

      markersRef.current.push(marker);
    });
  };

  const handleFilter = async (category: string) => {
    setActiveFilter(category);
    if (!mapInstanceRef.current) return;
    const L = (await import("leaflet")).default;

    const filtered =
      category === "todos" ? PLACES : PLACES.filter((p) => p.category === category);

    renderMarkers(L, mapInstanceRef.current, filtered);

    if (filtered.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
    }
  };

  const recenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([-25.85, -58.4], 8, { duration: 1.2 });
  };

  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-[#E8E2D5] bg-[#FAF7F1] shadow-xl shadow-[#0B2545]/10 z-10">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-[#E8E2D5] pointer-events-auto overflow-x-auto max-w-full">
          <button
            onClick={() => handleFilter("todos")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeFilter === "todos"
                ? "bg-[#0B2545] text-white shadow-sm"
                : "text-[#44576B] hover:text-[#0B2545] hover:bg-[#F3EEE3]"
            }`}
          >
            Todos ({PLACES.length})
          </button>
          <button
            onClick={() => handleFilter("alimentos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeFilter === "alimentos"
                ? "bg-[#17924E] text-white shadow-sm"
                : "text-[#44576B] hover:text-[#0B2545] hover:bg-[#F3EEE3]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#17924E]" />
            Alimentos
          </button>
          <button
            onClick={() => handleFilter("gastronomia")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeFilter === "gastronomia"
                ? "bg-[#F0A417] text-white shadow-sm"
                : "text-[#44576B] hover:text-[#0B2545] hover:bg-[#F3EEE3]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#F0A417]" />
            Gastronomía
          </button>
          <button
            onClick={() => handleFilter("artesanias")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeFilter === "artesanias"
                ? "bg-[#2FA8DE] text-white shadow-sm"
                : "text-[#44576B] hover:text-[#0B2545] hover:bg-[#F3EEE3]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#2FA8DE]" />
            Artesanías
          </button>
          <button
            onClick={() => handleFilter("b2b")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeFilter === "b2b"
                ? "bg-[#0B2545] text-white shadow-sm"
                : "text-[#44576B] hover:text-[#0B2545] hover:bg-[#F3EEE3]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0B2545]" />
            Mayorista B2B
          </button>
        </div>

        {/* Right action badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={recenter}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-[#0B2545] border border-[#E8E2D5] shadow-md hover:bg-[#F3EEE3] transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 text-[#17924E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path d="M12 8v8M8 12h8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Centrar Formosa
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[380px] sm:h-[440px] md:h-[500px] z-0"
      />

      {/* Bottom Floating Info Card for Active Selection */}
      {selectedPlace && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-[1000] p-4 bg-white/95 backdrop-blur-md border border-[#E8E2D5] rounded-2xl shadow-xl transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white mb-1.5"
                style={{
                  backgroundColor: CATEGORY_COLORS[selectedPlace.category] || "#17924E",
                }}
              >
                {selectedPlace.categoryLabel}
              </span>
              <h4 className="font-display text-base font-bold text-[#0B2545] leading-tight">
                {selectedPlace.name}
              </h4>
              <p className="text-xs text-[#44576B] mt-0.5 flex items-center gap-1">
                <span>📍 {selectedPlace.location}</span>
                <span className="text-zinc-300">•</span>
                <span className="font-medium text-[#17924E]">{selectedPlace.producer}</span>
              </p>
            </div>
            {selectedPlace.price && (
              <span className="text-xs font-bold text-[#0B2545] bg-[#F3EEE3] px-2.5 py-1 rounded-lg border border-[#E8E2D5] whitespace-nowrap">
                {selectedPlace.price}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-600 mt-2 line-clamp-1">
            {selectedPlace.highlight}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/productor/${selectedPlace.slug || "chacra-la-esperanza"}`}
              className="flex-1 text-center bg-[#17924E] hover:bg-[#0E7A3F] text-white text-xs font-bold py-2 px-3 rounded-full transition-colors shadow-sm"
            >
              Ver Catálogo del Productor
            </Link>
            <Link
              href="/b2b"
              className="text-center bg-[#0B2545] hover:bg-[#123657] text-white text-xs font-bold py-2 px-3 rounded-full transition-colors"
            >
              Canal B2B
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
