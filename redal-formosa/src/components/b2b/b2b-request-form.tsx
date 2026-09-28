"use client";

import { useId, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { b2bRepository } from "@/lib/b2b/b2b-repository";
import { BUSINESS_TYPES, FREQUENCIES, validateB2BRequest, type B2BRequestInput } from "@/lib/domain/b2b";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

const LOCALIDADES = ["Formosa Capital", "Clorinda", "Pirané", "El Colorado", "Laguna Naineck", "Ibarreta", "Las Lomitas", "Otra localidad"];

const EMPTY: B2BRequestInput = {
  razonSocial: "",
  tipo: "restaurante",
  localidad: LOCALIDADES[0],
  cuit: "",
  contacto: "",
  telefono: "",
  productos: "",
  volumen: "",
  frecuencia: "semanal",
  mensaje: "",
};

interface B2BRequestFormProps {
  /** Se llama tras publicar, para que la lista de solicitudes propias se actualice. */
  onCreated: () => void;
}

/** Pedido de cotización por volumen. Queda publicado para que los vendedores de la red se pongan en contacto. */
export function B2BRequestForm({ onCreated }: B2BRequestFormProps) {
  const uid = useId();
  const { user, loading } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const update =
    (field: keyof B2BRequestInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setSent(false);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validateB2BRequest(form);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await b2bRepository.create(form);
      setForm(EMPTY);
      setSent(true);
      onCreated();
    } catch (err) {
      const known = err instanceof Error && err.message.startsWith("Ya tenés");
      setError(known ? (err as Error).message : "No pudimos enviar la solicitud. Revisá los datos e intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="card space-y-3 p-6 text-center">
        <h3 className="text-heading">Ingresá para pedir tu cotización</h3>
        <p className="text-muted">Así los productores saben quién los contacta y vos podés seguir o cerrar tu solicitud.</p>
        <Link href="/login?next=%2Fb2b" className="btn btn-primary">
          Ingresar
        </Link>
      </div>
    );
  }

  const id = (name: string) => `${uid}-${name}`;

  return (
    <form onSubmit={submit} className="card space-y-5 p-5 sm:p-8" aria-label="Solicitar cotización mayorista">
      {error && <Alert tone="error">{error}</Alert>}
      {sent && <Alert tone="success">¡Listo! Tu solicitud ya está publicada. Los productores te van a escribir al teléfono que dejaste.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("razon")} label="Nombre del comercio">
          <input id={id("razon")} required value={form.razonSocial} onChange={update("razonSocial")} placeholder="Ej: Restaurante El Lapacho" className="field" />
        </Field>
        <Field id={id("tipo")} label="Tipo de establecimiento">
          <select id={id("tipo")} value={form.tipo} onChange={update("tipo")} className="field">
            {BUSINESS_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id={id("localidad")} label="Localidad de entrega">
          <select id={id("localidad")} value={form.localidad} onChange={update("localidad")} className="field">
            {LOCALIDADES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field id={id("cuit")} label="CUIT" optional hint="Solo si necesitás factura.">
          <input id={id("cuit")} inputMode="numeric" value={form.cuit} onChange={update("cuit")} placeholder="30-12345678-9" className="field" />
        </Field>
        <Field id={id("contacto")} label="Persona de contacto">
          <input id={id("contacto")} required autoComplete="name" value={form.contacto} onChange={update("contacto")} className="field" />
        </Field>
        <Field id={id("telefono")} label="WhatsApp" hint="Con código de área, sin 0 ni 15.">
          <input id={id("telefono")} required type="tel" autoComplete="tel" value={form.telefono} onChange={update("telefono")} placeholder="3704 123456" className="field" />
        </Field>
      </div>

      <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <Field id={id("productos")} label="Qué productos buscás">
          <input id={id("productos")} required value={form.productos} onChange={update("productos")} placeholder="Ej: mandioca, tomate, acelga" className="field" />
        </Field>
        <Field id={id("volumen")} label="Volumen estimado">
          <input id={id("volumen")} required value={form.volumen} onChange={update("volumen")} placeholder="Ej: 100 kg por semana" className="field" />
        </Field>
        <Field id={id("frecuencia")} label="Cada cuánto lo necesitás">
          <select id={id("frecuencia")} value={form.frecuencia} onChange={update("frecuencia")} className="field">
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id={id("mensaje")} label="Observaciones" optional hint="Días y horarios de recepción, calibre, envasado…">
        <textarea id={id("mensaje")} rows={3} maxLength={500} value={form.mensaje} onChange={update("mensaje")} className="field" />
      </Field>

      <button type="submit" disabled={saving} aria-busy={saving} className="btn btn-primary w-full !py-3 sm:w-auto">
        {saving ? "Enviando…" : "Publicar mi solicitud"}
      </button>
      <p className="text-xs text-muted">La solicitud queda visible para los productores de REDAL durante 30 días. Podés cerrarla cuando quieras.</p>
    </form>
  );
}
