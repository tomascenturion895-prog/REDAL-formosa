"use client";

import { useState } from "react";
import { insertEmprendimiento } from "@/lib/supabase/db-helpers";
import { createClient } from "@/lib/supabase/client";

interface ProductFormProps {
  emprendimientoId: string;
  onSuccess?: () => void;
}

export function ProductForm({ emprendimientoId, onSuccess }: ProductFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    unidad: "unidad",
    categoria_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const fileExt = file.name.split(".").pop();
    const fileName = `${emprendimientoId}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.nombre || !formData.precio) {
        throw new Error("Nombre y precio son requeridos");
      }

      const { error: err } = await (supabase
        .from("productos")
        .insert({
          emprendimiento_id: emprendimientoId,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: parseFloat(formData.precio),
          unidad: formData.unidad,
          imagen_url: imageUrl,
          categoria_id: formData.categoria_id || null,
          disponible: true,
        } as any) as any);

      if (err) throw err;

      setFormData({ nombre: "", descripcion: "", precio: "", unidad: "unidad", categoria_id: "" });
      setImageUrl("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-heading">Agregar producto</h3>

      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-1">
          Nombre del producto
        </label>
        <input
          id="nombre"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ej: Miel pura de abeja"
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
          placeholder="Describe tu producto..."
          rows={3}
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-foreground mb-1">
            Precio ($)
          </label>
          <input
            id="precio"
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="unidad" className="block text-sm font-medium text-foreground mb-1">
            Unidad
          </label>
          <select
            id="unidad"
            name="unidad"
            value={formData.unidad}
            onChange={handleChange}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="unidad">Unidad</option>
            <option value="kg">Kilogramo</option>
            <option value="litro">Litro</option>
            <option value="metro">Metro</option>
            <option value="pack">Pack</option>
          </select>
        </div>

        <div>
          <label htmlFor="imagen" className="block text-sm font-medium text-foreground mb-1">
            Imagen
          </label>
          <input
            id="imagen"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm file:rounded-control file:border-0 file:bg-action file:px-3 file:py-1 file:text-on-action file:font-medium file:cursor-pointer hover:file:bg-action-hover"
          />
        </div>
      </div>

      {imageUrl && (
        <div className="rounded-control border border-border overflow-hidden">
          <img src={imageUrl} alt="preview" className="w-full h-32 object-cover" />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-control bg-action px-5 py-2.5 font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Agregar producto"}
      </button>
    </form>
  );
}
