"use client";

import { useState } from "react";

import { b2bRepository } from "@/lib/b2b/b2b-repository";
import { businessLabel, daysLeft, frequencyLabel, type B2BRequest } from "@/lib/domain/b2b";
import { Alert } from "@/components/ui/alert";

interface B2BMyRequestsProps {
  requests: B2BRequest[];
  onChanged: () => void;
}

/** Solicitudes abiertas de la persona con sesión, con la opción de cerrarlas. */
export function B2BMyRequests({ requests, onChanged }: B2BMyRequestsProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (requests.length === 0) return null;

  const close = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await b2bRepository.close(id);
      onChanged();
    } catch {
      setError("No pudimos cerrar la solicitud. Intentá de nuevo.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section aria-labelledby="mis-solicitudes" className="space-y-3">
      <h2 id="mis-solicitudes" className="text-heading">
        Tus solicitudes abiertas
      </h2>
      {error && <Alert tone="error">{error}</Alert>}
      <ul className="space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-semibold">
                {r.razon_social} · {r.productos}
              </p>
              <p className="text-sm text-muted">
                {businessLabel(r.tipo_comercio)} · {r.volumen} · {frequencyLabel(r.frecuencia)} · vence en {daysLeft(r.expires_at)} días
              </p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" disabled={busyId === r.id} onClick={() => close(r.id)}>
              Cerrar solicitud
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
