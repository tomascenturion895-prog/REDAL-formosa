"use client";

import { useEffect, useState } from "react";
import { geoService, type GeolocationCoordinates } from "@/lib/geolocation/geo-service";
import { trackingService, type RepartidorUbicacion } from "@/lib/realtime/tracking-service";
import { MapComponent } from "./map-component";

interface RepartidorTrackerProps {
  repartidorId: string;
  destino: { lat: number; lng: number };
  isRepartidor?: boolean;
}

export function RepartidorTracker({
  repartidorId,
  destino,
  isRepartidor = false,
}: RepartidorTrackerProps) {
  const [location, setLocation] = useState<RepartidorUbicacion | undefined>();
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distancia, setDistancia] = useState<number>(0);
  const [velocidad, setVelocidad] = useState<number>(0);

  // Para repartidores: iniciar tracking de su ubicación
  useEffect(() => {
    if (!isRepartidor) return;

    if (!geoService.isGeolocationSupported()) {
      setError("Geolocalización no soportada en este dispositivo");
      return;
    }

    const startTracking = async () => {
      setIsTracking(true);

      geoService.watchLocation(
        async (coords) => {
          try {
            await trackingService.updateRepartidorLocation(
              repartidorId,
              coords
            );
            setVelocidad(coords.speed || 0);
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error actualizando ubicación");
          }
        },
        (err) => {
          setError(err.message);
          setIsTracking(false);
        }
      );
    };

    startTracking();

    return () => {
      geoService.stopWatching();
      setIsTracking(false);
    };
  }, [repartidorId, isRepartidor]);

  // Para clientes: suscribirse a ubicación del repartidor
  useEffect(() => {
    if (isRepartidor) return;

    trackingService.subscribeToRepartidorTracking(
      repartidorId,
      (loc) => {
        setLocation(loc);
        // Calcular distancia
        const dist = geoService.calculateDistance(
          loc.latitud,
          loc.longitud,
          destino.lat,
          destino.lng
        );
        setDistancia(dist);
      },
      (err) => {
        setError(err.message);
      }
    );

    // Cargar ubicación actual al inicio
    trackingService.getRepartidorCurrentLocation(repartidorId).then((loc) => {
      if (loc) {
        setLocation(loc);
        const dist = geoService.calculateDistance(
          loc.latitud,
          loc.longitud,
          destino.lat,
          destino.lng
        );
        setDistancia(dist);
      }
    });

    return () => {
      trackingService.unsubscribeFromTracking();
    };
  }, [repartidorId, destino, isRepartidor]);

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-surface border border-border p-4">
        <h3 className="text-heading mb-3">📍 Seguimiento en Tiempo Real</h3>

        {error && (
          <div className="mb-4 rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        {isRepartidor && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Estado de tracking:</span>
              <span
                className={`text-sm font-medium ${
                  isTracking ? "text-success" : "text-muted"
                }`}
              >
                {isTracking ? "🟢 Activo" : "⚪ Inactivo"}
              </span>
            </div>

            {velocidad > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Velocidad:</span>
                <span className="text-sm font-medium">
                  {(velocidad * 3.6).toFixed(1)} km/h
                </span>
              </div>
            )}
          </div>
        )}

        {location && !isRepartidor && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Distancia al destino:</span>
              <span className="text-sm font-semibold">
                {distancia.toFixed(2)} km
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Última actualización:</span>
              <span className="text-sm">
                {new Date(location.actualizado_en).toLocaleTimeString("es-AR")}
              </span>
            </div>

            {location.velocidad && location.velocidad > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Velocidad del repartidor:</span>
                <span className="text-sm font-medium">
                  {(location.velocidad * 3.6).toFixed(1)} km/h
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {location && (
        <MapComponent
          repartidorLocation={location}
          destino={destino}
          className="w-full h-96 rounded-card border border-border overflow-hidden"
        />
      )}

      {!location && !isRepartidor && (
        <div className="w-full h-96 rounded-card border border-border bg-surface-muted flex items-center justify-center">
          <p className="text-muted text-center">
            Esperando ubicación del repartidor...
          </p>
        </div>
      )}
    </div>
  );
}
