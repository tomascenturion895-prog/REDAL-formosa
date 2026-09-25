"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { LatLng } from "@/lib/domain/geo";

interface MapComponentProps {
  repartidorLocation?: { latitud: number; longitud: number };
  destino: LatLng;
  className?: string;
}

// Marcadores con divIcon: se estilan con los tokens de globals.css en lugar de imágenes embebidas.
const dot = (classes: string) =>
  L.divIcon({
    className: "",
    html: `<span class="block h-5 w-5 rounded-full border-2 border-white shadow-pop ${classes}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

export default function MapComponent({ repartidorLocation, destino, className = "h-96 w-full" }: MapComponentProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const courierMarker = useRef<L.Marker | null>(null);
  const route = useRef<L.Polyline | null>(null);

  // El mapa se crea una vez y se destruye al desmontar (antes quedaba vivo).
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current).setView([destino.lat, destino.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(instance);
    L.marker([destino.lat, destino.lng], { icon: dot("bg-action") }).addTo(instance).bindPopup("Destino de entrega");
    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
      courierMarker.current = null;
      route.current = null;
    };
  }, [destino.lat, destino.lng]);

  // Cada nueva posición mueve el marcador y la línea al destino.
  useEffect(() => {
    const instance = map.current;
    if (!instance || !repartidorLocation) return;
    const courier: L.LatLngTuple = [repartidorLocation.latitud, repartidorLocation.longitud];
    const target: L.LatLngTuple = [destino.lat, destino.lng];

    if (courierMarker.current) courierMarker.current.setLatLng(courier);
    else courierMarker.current = L.marker(courier, { icon: dot("bg-highlight") }).addTo(instance).bindPopup("Repartidor");

    if (route.current) route.current.setLatLngs([courier, target]);
    else route.current = L.polyline([courier, target], { color: "#0e7a3f", weight: 3, opacity: 0.7 }).addTo(instance);

    instance.fitBounds(L.latLngBounds([courier, target]).pad(0.2));
  }, [repartidorLocation, destino.lat, destino.lng]);

  return <div ref={container} className={className} role="img" aria-label="Mapa del recorrido del repartidor" />;
}
