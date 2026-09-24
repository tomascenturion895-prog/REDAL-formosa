"use client";

import { useEffect, useRef, useState } from "react";
import type { RepartidorUbicacion } from "@/lib/realtime/tracking-service";
import dynamic from "next/dynamic";

let L: any = null;

if (typeof window !== "undefined") {
  L = require("leaflet");
}

interface MapComponentProps {
  repartidorLocation?: RepartidorUbicacion;
  destino: { lat: number; lng: number };
  className?: string;
}

export function MapComponent({
  repartidorLocation,
  destino,
  className = "w-full h-96",
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRepartidor = useRef<L.Marker | null>(null);
  const markerDestino = useRef<L.Marker | null>(null);
  const lineRoute = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Inicializar mapa
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(
        [destino.lat, destino.lng],
        13
      );

      // Agregar layer de OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Marcador de destino
    if (!markerDestino.current) {
      markerDestino.current = L.marker([destino.lat, destino.lng], {
        icon: L.icon({
          iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234CAF50'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/%3E%3C/svg%3E",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(map.current!);

      markerDestino.current!.bindPopup("📍 Destino de entrega");
    }

    // Marcador de repartidor
    if (repartidorLocation) {
      const icon = L.icon({
        iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232196F3'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      if (markerRepartidor.current) {
        markerRepartidor.current.setLatLng([
          repartidorLocation.latitud,
          repartidorLocation.longitud,
        ]);
      } else {
        markerRepartidor.current = L.marker(
          [repartidorLocation.latitud, repartidorLocation.longitud],
          { icon }
        ).addTo(map.current!);

        markerRepartidor.current!.bindPopup("🚗 Repartidor");
      }

      // Dibujar línea de ruta
      if (lineRoute.current) {
        map.current!.removeLayer(lineRoute.current);
      }

      lineRoute.current = L.polyline(
        [
          [repartidorLocation.latitud, repartidorLocation.longitud],
          [destino.lat, destino.lng],
        ],
        { color: "#2196F3", weight: 3, opacity: 0.7 }
      ).addTo(map.current!);

      // Ajustar zoom para ver ambos puntos
      const group = new L.FeatureGroup([
        markerRepartidor.current,
        markerDestino.current!,
      ]);
      map.current!.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup no necesario ya que el mapa se reutiliza
    };
  }, [repartidorLocation, destino]);

  return <div ref={mapContainer} className={className} />;
}
