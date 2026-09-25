"use client";

import { useState } from "react";

import { PRODUCT_UNITS, stockNote, type ProductUnit, type VoiceProductDraft } from "@/lib/domain/voice-product";
import { producerRepository } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { CheckIcon } from "@/components/ui/icons";
import { VoiceToProduct } from "./voice-to-product";

const UNIT_LABEL: Record<ProductUnit, string> = {
  unidad: "Unidad",
  kg: "Kilogramo",
  litro: "Litro",
  metro: "Metro",
  pack: "Pack / docena",
};

interface QuickDraft {
  nombre: string;
  precio: string;
  unidad: ProductUnit;
  descripcion: string;
}

interface VoiceQuickAddProps {
  emprendimientoId: string;
  onCreated: () => void;
}

/**
 * Carga de un producto hablando, sin pasar por el formulario: la persona dice qué tiene, revisa una
 * tarjeta con lo entendido y publica. El formulario completo queda para fotos y descripciones largas.
 */
export function VoiceQuickAdd({ emprendimientoId, onCreated }: VoiceQuickAddProps) {
  const [draft, setDraft] = useState<QuickDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const fromVoice = (voice: VoiceProductDraft) => {
    setCreated(null);
    setDraft({
      nombre: voice.producto,
      precio: voice.precio === null ? "" : String(voice.precio),
      unidad: voice.unidad,
      descripcion: stockNote(voice),
    });
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await producerRepository.createProduct({
        emprendimientoId,
        nombre: draft.nombre.trim(),
        descripcion: draft.descripcion,
        precio: Number(draft.precio),
        unidad: draft.unidad,
      });
      setCreated(draft.nombre.trim());
      setDraft(null);
      onCreated();
    } catch {
      setError("No pudimos guardar el producto. Revisá los datos e intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof QuickDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

  return (
    <section id="cargar-por-voz" aria-labelledby="voz-title" className="card bg-organic space-y-4 p-5 sm:p-6">
      <div>
        <h2 id="voz-title" className="text-heading">
          Cargá un producto hablando
        </h2>
        <p className="mt-1 text-sm text-muted">Sin escribir: decí qué tenés, cuánto y a qué precio, y revisá antes de publicar.</p>
      </div>

      <VoiceToProduct onDraft={fromVoice} />

      {created && (
        <Alert tone="success">
          <span className="flex items-start gap-2">
            <CheckIcon size={18} className="mt-0.5 shrink-0" />
            <span>«{created}» quedó cargado. Se publica apenas un administrador lo revise.</span>
          </span>
        </Alert>
      )}

      {draft && (
        <form onSubmit={publish} className="space-y-4 rounded-card border border-action bg-surface p-4">
          <p className="text-sm font-semibold text-action">Esto entendimos. Corregí lo que haga falta:</p>
          {error && <Alert tone="error">{error}</Alert>}

          <div className="grid gap-3 sm:grid-cols-[1fr_9rem_10rem]">
            <label className="block text-sm font-medium">
              Producto
              <input required value={draft.nombre} onChange={update("nombre")} className="field mt-1" />
            </label>
            <label className="block text-sm font-medium">
              Precio ($)
              <input required type="number" min="1" step="1" inputMode="numeric" value={draft.precio} onChange={update("precio")} placeholder="0" className="field mt-1" />
            </label>
            <label className="block text-sm font-medium">
              Se vende por
              <select value={draft.unidad} onChange={update("unidad")} className="field mt-1">
                {PRODUCT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {UNIT_LABEL[unit]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {draft.descripcion && <p className="text-sm text-muted">{draft.descripcion}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" disabled={saving || !draft.precio} aria-busy={saving} className="btn btn-primary sm:flex-1">
              {saving ? "Publicando…" : "Publicar producto"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn btn-secondary">
              Descartar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
