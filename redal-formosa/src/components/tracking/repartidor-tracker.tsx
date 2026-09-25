"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { distanceKm, type LatLng } from "@/lib/domain/geo";
import { watchPosition } from "@/lib/geolocation/geolocation";
import { trackingService, type RepartidorUbicacion } from "@/lib/realtime/tracking-service";

// Leaflet solo existe en el navegador y pesa ~150 KB: se carga únicamente donde hay mapa.
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-card bg-surface-muted" aria-hidden="true" />,
});

interface RepartidorTrackerProps {
  repartidorId: string;
  destino: LatLng;
  /** true: el repartidor publica su posición. false: el comprador la sigue. */
  isRepartidor?: boolean;
}

export function RepartidorTracker({ repartidorId, destino, isRepartidor = false }: RepartidorTrackerProps) {
  const [location, setLocation] = useState<RepartidorUbicacion | undefined>();
  const [geolocationFailed, setGeolocationFailed] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const tracking = isRepartidor && !geolocationFailed;

  // Repartidor: publica su posición mientras la pantalla está abierta.
  useEffect(() => {
    if (!isRepartidor) return;
    return watchPosition(
      (position) => {
        setSpeed(position.speed ?? 0);
        trackingService
          .publish(repartidorId, position)
          .then(() => setError(null))
          .catch((e: Error) => setError(e.message));
      },
      (failure) => {
        setError(failure.message);
        setGeolocationFailed(true);
      },
    );
  }, [repartidorId, isRepartidor]);

  // Comprador: carga la última posición y se suscribe a los cambios.
  useEffect(() => {
    if (isRepartidor) return;
    let cancelled = false;
    trackingService
      .current(repartidorId)
      .then((current) => !cancelled && current && setLocation(current))
      .catch((e: Error) => !cancelled && setError(e.message));
    const unsubscribe = trackingService.subscribe(repartidorId, setLocation, (e) => setError(e.message));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [repartidorId, isRepartidor]);

  const distance = location ? distanceKm({ lat: location.latitud, lng: location.longitud }, destino) : null;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="text-heading mb-3">Seguimiento en tiempo real</h3>

        {error && (
          <div role="alert" className="mb-4 rounded-control bg-danger-soft px-4 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        {isRepartidor && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Seguimiento</dt>
              <dd className={`font-medium ${tracking ? "text-success" : "text-muted"}`}>{tracking ? "Activo" : "Inactivo"}</dd>
            </div>
            {speed > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Velocidad</dt>
                <dd className="font-medium tabular-nums">{(speed * 3.6).toFixed(1)} km/h</dd>
              </div>
            )}
          </dl>
        )}

        {!isRepartidor && location && distance !== null && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Distancia al destino</dt>
              <dd className="font-semibold tabular-nums">{distance.toFixed(2)} km</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Última actualización</dt>
              <dd>{new Date(location.actualizado_en).toLocaleTimeString("es-AR")}</dd>
            </div>
            {location.velocidad ? (
              <div className="flex justify-between">
                <dt className="text-muted">Velocidad del repartidor</dt>
                <dd className="font-medium tabular-nums">{(location.velocidad * 3.6).toFixed(1)} km/h</dd>
              </div>
            ) : null}
          </dl>
        )}
      </div>

      {location ? (
        <MapComponent
          repartidorLocation={location}
          destino={destino}
          className="h-96 w-full overflow-hidden rounded-card border border-border"
        />
      ) : (
        !isRepartidor && (
          <div className="flex h-96 w-full items-center justify-center rounded-card border border-border bg-surface-muted">
            <p className="text-center text-muted">Esperando la ubicación del repartidor…</p>
          </div>
        )
      )}
    </div>
  );
}
