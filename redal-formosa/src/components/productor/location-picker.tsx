"use client";

import { useState } from "react";

import { getCurrentPosition, type GeolocationFailure } from "@/lib/geolocation/geolocation";
import { Alert } from "@/components/ui/alert";
import { CheckIcon, MapPinIcon, SearchIcon } from "@/components/ui/icons";

interface Candidate {
  lat: number;
  lng: number;
  label: string;
}

interface LocationPickerProps {
  address: string;
  onLocate: (coords: { latitud: string; longitud: string }) => void;
}

const toField = (value: number) => value.toFixed(6);

/** Convierte la dirección escrita (o la ubicación del dispositivo) en coordenadas para el mapa. */
export function LocationPicker({ address, onLocate }: LocationPickerProps) {
  const [busy, setBusy] = useState<"address" | "device" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);

  const choose = (candidate: Candidate) => {
    onLocate({ latitud: toField(candidate.lat), longitud: toField(candidate.lng) });
    setChosen(candidate.label);
    setCandidates([]);
  };

  const locateAddress = async () => {
    setError(null);
    setChosen(null);
    setCandidates([]);
    setBusy("address");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(address.trim())}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "No pudimos buscar la dirección.");
        return;
      }
      const results: Candidate[] = data.results ?? [];
      if (results.length === 0) {
        setError("No encontramos esa dirección en Formosa. Probá con calle y número, o usá tu ubicación actual.");
      } else if (results.length === 1) {
        choose(results[0]);
      } else {
        setCandidates(results);
      }
    } catch {
      setError("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  };

  const locateDevice = async () => {
    setError(null);
    setChosen(null);
    setCandidates([]);
    setBusy("device");
    try {
      const { latitude, longitude } = await getCurrentPosition();
      onLocate({ latitud: toField(latitude), longitud: toField(longitude) });
      setChosen("Tu ubicación actual");
    } catch (failure) {
      setError((failure as GeolocationFailure).message ?? "No pudimos obtener tu ubicación.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={locateAddress}
          disabled={busy !== null || address.trim().length < 4}
          aria-busy={busy === "address"}
          className="btn btn-secondary btn-sm"
        >
          {busy !== "address" && <SearchIcon size={16} />}
          Ubicar en el mapa
        </button>
        <button type="button" onClick={locateDevice} disabled={busy !== null} aria-busy={busy === "device"} className="btn btn-secondary btn-sm">
          {busy !== "device" && <MapPinIcon size={16} />}
          Usar mi ubicación actual
        </button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {candidates.length > 0 && (
        <div role="group" aria-label="Resultados de la búsqueda" className="space-y-2">
          <p className="text-sm font-medium">Elegí cuál es la tuya:</p>
          <ul className="space-y-2">
            {candidates.map((candidate) => (
              <li key={`${candidate.lat},${candidate.lng}`}>
                <button type="button" onClick={() => choose(candidate)} className="card card-interactive w-full p-3 text-left text-sm">
                  {candidate.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {chosen && (
        <Alert tone="success">
          <span className="flex items-start gap-2">
            <CheckIcon size={18} className="mt-0.5 shrink-0" />
            <span>
              Ubicación cargada: {chosen}. Revisá que los números de abajo sean los correctos antes de continuar.
            </span>
          </span>
        </Alert>
      )}
    </div>
  );
}
