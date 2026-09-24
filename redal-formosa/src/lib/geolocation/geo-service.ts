export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class GeoLocationService {
  private watchId: number | null = null;
  private isSupported = false;

  constructor() {
    this.isSupported = !!navigator?.geolocation;
  }

  isGeolocationSupported(): boolean {
    return this.isSupported;
  }

  getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject({
          code: 1,
          message: "Geolocalización no soportada en este navegador",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject({
            code: error.code,
            message: this.getErrorMessage(error.code),
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  watchLocation(
    onSuccess: (coords: GeolocationCoordinates) => void,
    onError: (error: LocationError) => void
  ): void {
    if (!this.isSupported) {
      onError({
        code: 1,
        message: "Geolocalización no soportada",
      });
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        onError({
          code: error.code,
          message: this.getErrorMessage(error.code),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return "Permiso de geolocalización denegado";
      case 2:
        return "Posición no disponible";
      case 3:
        return "Timeout solicitando geolocalización";
      default:
        return "Error desconocido en geolocalización";
    }
  }
}

export const geoService = new GeoLocationService();
