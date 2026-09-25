"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FORMOSA_PROVINCE_VIEW, type MapPoint } from "@/lib/domain/map";

export interface EmprendimientosMapProps {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** false en vistas previas: se puede arrastrar pero la rueda no captura el scroll de la página. */
  scrollZoom?: boolean;
  className?: string;
}

// Los pines se estilizan con los tokens de globals.css. No se arma HTML con texto de personas
// (nombre, dirección): el detalle se muestra en una tarjeta de React, que escapa el contenido.
function pin(selected: boolean) {
  const size = selected ? 34 : 26;
  const look = selected ? "bg-highlight ring-4 ring-highlight/40" : "bg-action";
  return L.divIcon({
    className: "",
    html: `<span class="block rounded-full border-[3px] border-white shadow-pop ${look}" style="width:${size}px;height:${size}px"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function fit(map: L.Map, points: MapPoint[]) {
  if (points.length === 0) {
    map.setView([FORMOSA_PROVINCE_VIEW.center.lat, FORMOSA_PROVINCE_VIEW.center.lng], FORMOSA_PROVINCE_VIEW.zoom);
  } else if (points.length === 1) {
    map.setView([points[0].position.lat, points[0].position.lng], 12);
  } else {
    map.fitBounds(L.latLngBounds(points.map((p) => [p.position.lat, p.position.lng] as L.LatLngTuple)).pad(0.2), { maxZoom: 13 });
  }
}

export default function EmprendimientosMap({ points, selectedId = null, onSelect, scrollZoom = true, className = "h-full w-full" }: EmprendimientosMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  const pointsRef = useRef(points);

  useEffect(() => {
    onSelectRef.current = onSelect;
    pointsRef.current = points;
  });

  // El mapa se crea una vez y se destruye al desmontar.
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { scrollWheelZoom: scrollZoom, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(instance);
    layer.current = L.layerGroup().addTo(instance);
    map.current = instance;
    fit(instance, pointsRef.current);

    return () => {
      instance.remove();
      map.current = null;
      layer.current = null;
    };
  }, [scrollZoom]);

  // Ajusta el encuadre cuando cambia el conjunto de puntos (no al seleccionar uno).
  const pointsKey = points.map((p) => p.id).join(",");
  useEffect(() => {
    if (map.current) fit(map.current, pointsRef.current);
  }, [pointsKey]);

  // Dibuja los pines; el seleccionado se destaca.
  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    for (const point of points) {
      L.marker([point.position.lat, point.position.lng], {
        icon: pin(point.id === selectedId),
        title: point.nombre,
        alt: point.nombre,
        zIndexOffset: point.id === selectedId ? 1000 : 0,
      })
        .on("click", () => onSelectRef.current?.(point.id))
        .addTo(group);
    }
  }, [points, selectedId]);

  // Al elegir un emprendimiento (desde la lista o un pin), el mapa lo acerca.
  useEffect(() => {
    const target = points.find((p) => p.id === selectedId);
    if (map.current && target) {
      map.current.flyTo([target.position.lat, target.position.lng], Math.max(map.current.getZoom(), 12), { duration: 0.8 });
    }
    // Solo reacciona a la selección: `points` cambia de referencia sin que cambie el elegido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={container} className={className} role="application" aria-label="Mapa de emprendimientos de Formosa" />;
}
