"use client";

import { useState } from "react";
import { insertEmprendimiento } from "@/lib/supabase/db-helpers";

interface SucursalFormProps {
  emprendimientoId: string;
  onSuccess?: () => void;
}

export function SucursalesForm({ emprendimientoId, onSuccess }: SucursalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    latitud: "",
    longitud: "",
    horario_apertura: "09:00",
    horario_cierre: "18:00",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const latitud = formData.latitud ? parseFloat(formData.latitud) : null;
      const longitud = formData.longitud ? parseFloat(formData.longitud) : null;

      const { error: err } = await insertEmprendimiento({
        nombre: formData.nombre,
        direccion: formData.direccion,
        latitud,
        longitud,
        horario_apertura: formData.horario_apertura,
        horario_cierre: formData.horario_cierre,
        owner_id: emprendimientoId,
      });

      if (err) throw err;

      setFormData({
        nombre: "",
        direccion: "",
        latitud: "",
        longitud: "",
        horario_apertura: "09:00",
        horario_cierre: "18:00",
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar sucursal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-heading">Agregar sucursal</h3>

      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-1">
          Nombre de la sucursal
        </label>
        <input
          id="nombre"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ej: Local Centro"
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-foreground mb-1">
          Dirección
        </label>
        <input
          id="direccion"
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          required
          placeholder="Ej: Calle Principal 123"
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="latitud" className="block text-sm font-medium text-foreground mb-1">
            Latitud
          </label>
          <input
            id="latitud"
            type="number"
            name="latitud"
            value={formData.latitud}
            onChange={handleChange}
            step="0.00001"
            placeholder="-25.4944"
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="longitud" className="block text-sm font-medium text-foreground mb-1">
            Longitud
          </label>
          <input
            id="longitud"
            type="number"
            name="longitud"
            value={formData.longitud}
            onChange={handleChange}
            step="0.00001"
            placeholder="-55.5038"
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="horario_apertura" className="block text-sm font-medium text-foreground mb-1">
            Hora de apertura
          </label>
          <input
            id="horario_apertura"
            type="time"
            name="horario_apertura"
            value={formData.horario_apertura}
            onChange={handleChange}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="horario_cierre" className="block text-sm font-medium text-foreground mb-1">
            Hora de cierre
          </label>
          <input
            id="horario_cierre"
            type="time"
            name="horario_cierre"
            value={formData.horario_cierre}
            onChange={handleChange}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-control bg-highlight px-5 py-2.5 font-medium text-on-highlight transition-colors duration-150 ease-soft disabled:opacity-60"
      >
        {loading ? "Agregando..." : "Agregar sucursal"}
      </button>
    </form>
  );
}
