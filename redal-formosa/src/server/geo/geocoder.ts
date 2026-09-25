import { ServiceError } from "../errors";

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
}

/** Puerto: dirección escrita por una persona → posibles ubicaciones. */
export interface Geocoder {
  search(address: string): Promise<GeocodeResult[]>;
}

// Provincia de Formosa (oeste, norte, este, sur). Acota la búsqueda para no confundir calles homónimas.
const FORMOSA_VIEWBOX = "-62.4,-22.4,-57.5,-27.6";

/**
 * Limpia lo que la gente escribe para que el buscador lo entienda: "Formosa Capital Calle Santiago
 * del Estero 480" pasa a "Santiago del Estero 480, Formosa, Argentina".
 */
export function buildSearchQuery(raw: string): string {
  const cleaned = raw
    .replace(/\b(formosa\s+capital|capital)\b/gi, " ")
    .replace(/\bcalle\b/gi, " ")
    .replace(/\bformosa\b/gi, " ")
    .replace(/[,;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${cleaned}, Formosa, Argentina`;
}

interface NominatimRow {
  lat?: string;
  lon?: string;
  display_name?: string;
}

interface Options {
  /** Nominatim exige identificar la aplicación: incluí un contacto. */
  userAgent: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

/** Adaptador de Nominatim (OpenStreetMap). Uso moderado: máximo 1 pedido por segundo en total. */
export class NominatimGeocoder implements Geocoder {
  constructor(private readonly options: Options) {}

  async search(address: string): Promise<GeocodeResult[]> {
    const { userAgent, baseUrl = "https://nominatim.openstreetmap.org", fetchImpl = fetch } = this.options;
    const params = new URLSearchParams({
      q: buildSearchQuery(address),
      format: "jsonv2",
      limit: "4",
      countrycodes: "ar",
      viewbox: FORMOSA_VIEWBOX,
      bounded: "1",
      "accept-language": "es",
    });

    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}/search?${params}`, {
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceError("unavailable", "No pudimos buscar la dirección. Probá de nuevo en un momento.");
    }
    if (!response.ok) {
      console.error("Nominatim respondió", response.status);
      throw new ServiceError("unavailable", "El buscador de direcciones no está disponible ahora. Probá más tarde.");
    }

    const rows = (await response.json().catch(() => [])) as NominatimRow[];
    return (Array.isArray(rows) ? rows : []).flatMap((row) => {
      const lat = Number(row.lat);
      const lng = Number(row.lon);
      const label = typeof row.display_name === "string" ? row.display_name.slice(0, 160) : "";
      return Number.isFinite(lat) && Number.isFinite(lng) && label ? [{ lat, lng, label }] : [];
    });
  }
}
