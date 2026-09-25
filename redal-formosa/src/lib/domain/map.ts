import type { LatLng } from "./geo";

export interface MapPoint {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  position: LatLng;
}

interface Locatable {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  latitud: number | null;
  longitud: number | null;
}

/** Vista inicial: la provincia de Formosa. */
export const FORMOSA_PROVINCE_VIEW = { center: { lat: -25.85, lng: -58.4 } as LatLng, zoom: 8 };

const isCoordinate = (lat: number | null, lng: number | null): lat is number =>
  lat !== null &&
  lng !== null &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  // (0, 0) es el valor que aparece cuando una ubicación no se cargó bien
  !(lat === 0 && lng === 0);

/** Solo los emprendimientos con una ubicación utilizable se dibujan en el mapa. */
export function toMapPoints(rows: readonly Locatable[]): MapPoint[] {
  return rows.flatMap((r) =>
    isCoordinate(r.latitud, r.longitud)
      ? [{ id: r.id, nombre: r.nombre, direccion: r.direccion, telefono: r.telefono, position: { lat: r.latitud, lng: r.longitud! } }]
      : [],
  );
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Búsqueda por nombre o dirección, sin distinguir mayúsculas ni acentos ("chacra" encuentra "Chácra"). */
export function filterPoints(points: readonly MapPoint[], term: string): MapPoint[] {
  const query = normalize(term.trim());
  if (!query) return [...points];
  return points.filter((p) => normalize(`${p.nombre} ${p.direccion ?? ""}`).includes(query));
}

/** Enlace para abrir la ruta hasta el punto en la app de mapas del dispositivo. */
export function directionsUrl({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
