"use client";

import { useState } from "react";

import { stockNote, type VoiceProductDraft } from "@/lib/domain/voice-product";
import { producerRepository } from "@/lib/producer/producer-repository";
import { VoiceToProduct } from "./voice-to-product";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { ProductImage } from "@/components/ui/product-image";

interface ProductFormProps {
  emprendimientoId: string;
  onSuccess?: () => void;
}

const UNITS = [
  ["unidad", "Unidad"],
  ["kg", "Kilogramo"],
  ["litro", "Litro"],
  ["metro", "Metro"],
  ["pack", "Pack"],
] as const;

const EMPTY = { nombre: "", descripcion: "", precio: "", unidad: "unidad" };

export function ProductForm({ emprendimientoId, onSuccess }: ProductFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const applyDraft = (draft: VoiceProductDraft) =>
    setForm((prev) => {
      const note = stockNote(draft);
      return {
        ...prev,
        nombre: draft.producto,
        precio: draft.precio === null ? prev.precio : String(draft.precio),
        unidad: draft.unidad,
        descripcion: [prev.descripcion.replace(/\s*Disponibles: [^.]*\.?$/, "").trim(), note].filter(Boolean).join(" "),
      };
    });

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      setImageUrl(await producerRepository.uploadProductImage(emprendimientoId, file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await producerRepository.createProduct({
        emprendimientoId,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: parseFloat(form.precio),
        unidad: form.unidad,
        imagenUrl: imageUrl,
      });
      setForm(EMPTY);
      setImageUrl("");
      onSuccess?.();
    } catch {
      setError("No pudimos crear el producto. Revisá los datos e intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <VoiceToProduct onDraft={applyDraft} />

      <Field id="nombre" label="Nombre del producto">
        <input id="nombre" required value={form.nombre} onChange={update("nombre")} placeholder="Ej: Miel pura de abeja" className="field" />
      </Field>

      <Field id="descripcion" label="Descripción" optional>
        <textarea id="descripcion" rows={3} value={form.descripcion} onChange={update("descripcion")} placeholder="Contá cómo es y cómo se produce" className="field" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="precio" label="Precio ($)">
          <input id="precio" type="number" required step="0.01" min="0" value={form.precio} onChange={update("precio")} placeholder="0" className="field" />
        </Field>

        <Field id="unidad" label="Se vende por">
          <select id="unidad" value={form.unidad} onChange={update("unidad")} className="field">
            {UNITS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="imagen" label="Foto" optional hint="JPG, PNG o WebP, hasta 5 MB.">
          <input
            id="imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => handleImage(e.target.files?.[0])}
            className="field text-sm file:mr-3 file:rounded-control file:border-0 file:bg-action file:px-3 file:py-1 file:font-medium file:text-on-action"
          />
        </Field>
      </div>

      {imageUrl && (
        <div className="relative h-32 overflow-hidden rounded-control border border-border">
          <ProductImage src={imageUrl} alt="Vista previa de la foto del producto" sizes="(min-width: 640px) 400px, 100vw" />
        </div>
      )}

      <button type="submit" disabled={saving || uploading} aria-busy={saving || uploading} className="btn btn-primary w-full !py-3">
        {saving ? "Guardando…" : uploading ? "Subiendo foto…" : "Agregar producto"}
      </button>
    </form>
  );
}
