"use client";

import { useId, useState } from "react";

import { producerRepository, type Emprendimiento } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

interface ProductorFormProps {
  userId: string;
  defaultEmail?: string;
  onSuccess?: (emprendimientoId: string) => void;
  /** Si se pasa, el formulario edita ese emprendimiento en vez de crear uno nuevo. */
  emprendimiento?: Emprendimiento;
}

export function ProductorForm({ userId, defaultEmail = "", onSuccess, emprendimiento }: ProductorFormProps) {
  const uid = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nombre: emprendimiento?.nombre ?? "",
    descripcion: emprendimiento?.descripcion ?? "",
    telefono: emprendimiento?.telefono ?? "",
    email: emprendimiento ? (emprendimiento.email ?? "") : defaultEmail,
  });

  const update =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
    };
    setSaved(false);
    try {
      if (emprendimiento) {
        await producerRepository.updateEmprendimiento(emprendimiento.id, data);
        setSaved(true);
        setLoading(false);
        onSuccess?.(emprendimiento.id);
      } else {
        // En alta el botón queda deshabilitado hasta que la pantalla siguiente reemplaza al formulario (evita duplicar).
        onSuccess?.(await producerRepository.createEmprendimiento({ ownerId: userId, ...data }));
      }
    } catch {
      setError("No pudimos guardar tu emprendimiento. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {saved && <Alert tone="success">Guardamos los cambios.</Alert>}

      <Field id={`${uid}-nombre`} label="Nombre del emprendimiento">
        <input id={`${uid}-nombre`} required value={form.nombre} onChange={update("nombre")} placeholder="Ej: Miel Pura Formosa" className="field" />
      </Field>

      <Field id={`${uid}-descripcion`} label="Descripción">
        <textarea
          id={`${uid}-descripcion`}
          rows={4}
          value={form.descripcion}
          onChange={update("descripcion")}
          placeholder="Contá qué producís y qué te hace especial"
          className="field"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-telefono`} label="Teléfono" hint="Con código de área, sin 0 ni 15. Los compradores te van a poder escribir por WhatsApp a este número.">
          <input id={`${uid}-telefono`} type="tel" autoComplete="tel" value={form.telefono} onChange={update("telefono")} placeholder="3704 123456" className="field" />
        </Field>
        <Field id={`${uid}-email`} label="Email de contacto">
          <input id={`${uid}-email`} type="email" value={form.email} onChange={update("email")} className="field" />
        </Field>
      </div>

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-3">
        {loading ? "Guardando…" : emprendimiento ? "Guardar cambios" : "Continuar"}
      </button>
    </form>
  );
}
