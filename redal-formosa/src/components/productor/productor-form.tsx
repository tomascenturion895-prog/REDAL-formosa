"use client";

import { useState } from "react";

import { producerRepository } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

interface ProductorFormProps {
  userId: string;
  defaultEmail?: string;
  onSuccess?: (emprendimientoId: string) => void;
}

export function ProductorForm({ userId, defaultEmail = "", onSuccess }: ProductorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", telefono: "", email: defaultEmail });

  const update =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const id = await producerRepository.createEmprendimiento({
        ownerId: userId,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
      });
      onSuccess?.(id);
    } catch {
      setError("No pudimos guardar tu emprendimiento. Intentá de nuevo.");
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
        <Field id="telefono" label="Teléfono" hint="Con código de área, sin 0 ni 15. Los compradores te van a poder escribir por WhatsApp a este número.">
          <input id="telefono" type="tel" autoComplete="tel" value={form.telefono} onChange={update("telefono")} placeholder="3704 123456" className="field" />
        </Field>
        <Field id="email" label="Email de contacto">
          <input id="email" type="email" value={form.email} onChange={update("email")} className="field" />
        </Field>
      </div>

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-3">
        {loading ? "Guardando…" : "Continuar"}
      </button>
    </form>
  );
}
