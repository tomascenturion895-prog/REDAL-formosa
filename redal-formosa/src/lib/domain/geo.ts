export interface LatLng {
  lat: number;
  lng: number;
}

/** Centro de Formosa capital. Se usa cuando un pedido todavía no guarda coordenadas de entrega. */
export const FORMOSA_CENTER: LatLng = { lat: -26.1775, lng: -58.1781 };

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distancia en km entre dos puntos sobre la superficie terrestre (fórmula de haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
