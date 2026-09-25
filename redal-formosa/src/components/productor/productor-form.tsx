"use client";

import { useState } from "react";

import { producerRepository } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

interface ProductorFormProps {
  userId: string;
  emprendimientoId?: string;
  initial?: Partial<{
    nombre: string;
    descripcion: string | null;
    telefono: string | null;
    email: string | null;
  }>;
  defaultEmail?: string;
  submitLabel?: string;
  onSuccess?: (emprendimientoId: string) => void;
  onCancel?: () => void;
}

export function ProductorForm({
  userId,
  emprendimientoId,
  initial,
  defaultEmail = "",
  submitLabel,
  onSuccess,
  onCancel,
}: ProductorFormProps) {
  const isEditing = Boolean(emprendimientoId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: initial?.nombre ?? "",
    descripcion: initial?.descripcion ?? "",
    telefono: initial?.telefono ?? "",
    email: initial?.email ?? defaultEmail,
  });

  const update =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (emprendimientoId) {
        await producerRepository.updateEmprendimiento(emprendimientoId, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          telefono: form.telefono.trim() || null,
          email: form.email.trim() || null,
        });
        onSuccess?.(emprendimientoId);
      } else {
        const id = await producerRepository.createEmprendimiento({
          ownerId: userId,
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          telefono: form.telefono.trim() || null,
          email: form.email.trim() || null,
        });
        onSuccess?.(id);
      }
    } catch {
      setError(
        isEditing
          ? "No pudimos actualizar tu emprendimiento. Intentá de nuevo."
          : "No pudimos guardar tu emprendimiento. Intentá de nuevo.",
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <Field id="nombre" label="Nombre del emprendimiento">
        <input id="nombre" required value={form.nombre} onChange={update("nombre")} placeholder="Ej: Miel Pura Formosa" className="field" />
      </Field>

      <Field id="descripcion" label="Descripción">
        <textarea
          id="descripcion"
          rows={4}
          value={form.descripcion}
          onChange={update("descripcion")}
          placeholder="Contá qué producís y qué te hace especial"
          className="field"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="telefono" label="Teléfono">
          <input id="telefono" type="tel" autoComplete="tel" value={form.telefono} onChange={update("telefono")} placeholder="3704 123456" className="field" />
        </Field>
        <Field id="email" label="Email de contacto">
          <input id="email" type="email" value={form.email} onChange={update("email")} className="field" />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary flex-1 !py-3"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="btn btn-primary flex-1 !py-3"
        >
          {loading ? "Guardando…" : submitLabel ?? (isEditing ? "Guardar cambios" : "Continuar")}
        </button>
      </div>
    </form>
  );
}
