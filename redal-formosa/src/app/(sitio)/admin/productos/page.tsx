"use client";

import { useState } from "react";

import { adminRepository } from "@/lib/admin/admin-repository";
import { formatDate, formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";

export default function AdminProductosPage() {
  const { data: products, error: loadError, reload } = useAsync(() => adminRepository.pendingProducts(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resolve = async (id: string, action: () => Promise<void>) => {
    setBusy(id);
    setError(null);
    try {
      await action();
      setRejecting(null);
      setReason("");
      reload();
    } catch {
      setError("No se pudo guardar la decisión. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return <Alert tone="error">No pudimos cargar los productos pendientes.</Alert>;
  if (!products) return <div aria-busy="true" className="h-40" />;

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<CheckIcon size={36} />}
        title="No hay productos para revisar"
        description="Los productos nuevos aparecen acá hasta que los apruebes."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <p className="text-sm text-muted">
        {products.length} {products.length === 1 ? "producto esperando" : "productos esperando"} revisión.
      </p>

      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p.id} className="card p-5">
            <div className="flex flex-wrap gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                <ProductImage src={p.imagen_url} sizes="80px" iconSize={28} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold">{p.nombre}</h2>
                <p className="text-sm text-muted">
                  {formatPrice(p.precio)} · {p.unidad} · de {p.emprendimiento_nombre}
                  {p.productor_email ? ` (${p.productor_email})` : ""}
                </p>
                {p.descripcion && <p className="mt-2 line-clamp-2 text-sm">{p.descripcion}</p>}
                <p className="mt-1 text-xs text-muted">Publicado el {formatDate(p.created_at)}</p>
              </div>

              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busy === p.id}
                  onClick={() => resolve(p.id, () => adminRepository.approveProduct(p.id))}
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={busy === p.id}
                  onClick={() => setRejecting(rejecting === p.id ? null : p.id)}
                >
                  Rechazar
                </button>
              </div>
            </div>

            {rejecting === p.id && (
              <form
                className="mt-4 space-y-3 border-t border-border pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void resolve(p.id, () => adminRepository.rejectProduct(p.id, reason.trim()));
                }}
              >
                <label htmlFor={`reason-${p.id}`} className="block text-sm font-medium">
                  Motivo del rechazo <span className="font-normal text-muted">(lo ve el emprendedor)</span>
                </label>
                <textarea
                  id={`reason-${p.id}`}
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="field"
                  placeholder="Ej: la foto no muestra el producto"
                />
                <button type="submit" className="btn btn-danger btn-sm" disabled={busy === p.id || !reason.trim()}>
                  Confirmar rechazo
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
