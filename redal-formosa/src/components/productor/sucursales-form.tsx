"use client";

import { useState } from "react";

import { producerRepository } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

interface SucursalFormProps {
  emprendimientoId: string;
  onSuccess?: () => void;
}

// Ubicación y horarios del emprendimiento (actualiza el que se acaba de crear).
export function SucursalesForm({ emprendimientoId, onSuccess }: SucursalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    direccion: "",
    latitud: "",
    longitud: "",
    horario_apertura: "09:00",
    horario_cierre: "18:00",
  });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await producerRepository.setLocation(emprendimientoId, {
        direccion: form.direccion.trim(),
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        horario_apertura: form.horario_apertura,
        horario_cierre: form.horario_cierre,
      });
      onSuccess?.();
    } catch {
      setError("No pudimos guardar la ubicación. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <Field id="direccion" label="Dirección">
        <input id="direccion" required value={form.direccion} onChange={update("direccion")} placeholder="Calle, número y barrio" className="field" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="latitud" label="Latitud" optional>
          <input id="latitud" type="number" step="any" value={form.latitud} onChange={update("latitud")} placeholder="-26.1775" className="field" />
        </Field>
        <Field id="longitud" label="Longitud" optional>
          <input id="longitud" type="number" step="any" value={form.longitud} onChange={update("longitud")} placeholder="-58.1781" className="field" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="horario_apertura" label="Abrís a las">
          <input id="horario_apertura" type="time" value={form.horario_apertura} onChange={update("horario_apertura")} className="field" />
        </Field>
        <Field id="horario_cierre" label="Cerrás a las">
          <input id="horario_cierre" type="time" value={form.horario_cierre} onChange={update("horario_cierre")} className="field" />
        </Field>
      </div>

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-3">
        {loading ? "Guardando…" : "Continuar"}
      </button>
    </form>
  );
}
