export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
}

export interface GeolocationFailure {
  code: number;
  message: string;
}

const MESSAGES: Record<number, string> = {
  1: "Permiso de geolocalización denegado",
  2: "Posición no disponible",
  3: "La geolocalización tardó demasiado",
};

export const isGeolocationSupported = () => typeof navigator !== "undefined" && "geolocation" in navigator;

/** Posición actual, una sola vez. Rechaza con un GeolocationFailure legible. */
export function getCurrentPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({ code: 0, message: "Este dispositivo no soporta geolocalización" } satisfies GeolocationFailure);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
      (err) => reject({ code: err.code, message: MESSAGES[err.code] ?? "Error de geolocalización" } satisfies GeolocationFailure),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

/**
 * Sigue la posición del dispositivo. Devuelve la función que detiene el seguimiento,
 * así cada componente gestiona el suyo sin compartir estado.
 */
export function watchPosition(onPosition: (p: Position) => void, onError: (e: GeolocationFailure) => void): () => void {
  if (!isGeolocationSupported()) {
    onError({ code: 0, message: "Este dispositivo no soporta geolocalización" });
    return () => {};
  }

  const id = navigator.geolocation.watchPosition(
    ({ coords }) =>
      onPosition({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        heading: coords.heading ?? undefined,
        speed: coords.speed ?? undefined,
      }),
    (err) => onError({ code: err.code, message: MESSAGES[err.code] ?? "Error de geolocalización" }),
    { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
  );

  return () => navigator.geolocation.clearWatch(id);
}
