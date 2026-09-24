"use client";

import { useState } from "react";
import { insertEmprendimiento, updateProfileField } from "@/lib/supabase/db-helpers";

interface ProductorFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function ProductorForm({ userId, onSuccess }: ProductorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    telefono: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: err } = await updateProfileField(userId, "full_name", formData.nombre);
      if (err) throw err;

      const { error: empErr } = await insertEmprendimiento({
        owner_id: userId,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        telefono: formData.telefono,
        email: formData.email,
      });

      if (empErr) throw empErr;
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-1">
          Nombre del emprendimiento
        </label>
        <input
          id="nombre"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ej: Miel Pura Formosa"
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-foreground mb-1">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Describí tu emprendimiento y lo que ofrecés"
          rows={4}
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-1">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+54 3764 12345678"
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contacto@emprendimiento.com"
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-control bg-action px-5 py-2.5 font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Continuar"}
      </button>
    </form>
  );
}
