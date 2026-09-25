"use client";

import { useState } from "react";

import { formatPrice } from "@/lib/format";
import { producerRepository, type Product } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { MicIcon, TrashIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";

interface ProductListProps {
  products: Product[];
  /** Se llama después de cambiar algo, para que el padre vuelva a cargar. */
  onChanged: () => void;
}

// Estado que ve el productor según la revisión del administrador.
function reviewStatus(p: Product): { label: string; tone: string } {
  if (p.validado) {
    return p.disponible
      ? { label: "Publicado", tone: "bg-success-soft text-success" }
      : { label: "Oculto", tone: "bg-surface-muted text-muted" };
  }
  if (p.razon_rechazo) return { label: "Rechazado", tone: "bg-danger-soft text-danger" };
  return { label: "En revisión", tone: "bg-warning-soft text-warning" };
}

/** Catálogo del vendedor como grilla de tarjetas: se lee bien en el celular y permite ocultar con un toque. */
export function ProductList({ products, onChanged }: ProductListProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleAvailability = async (p: Product) => {
    setActionError(null);
    setTogglingId(p.id);
    try {
      await producerRepository.setProductAvailability(p.id, !p.disponible);
      onChanged();
    } catch {
      setActionError("No pudimos actualizar el producto.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await producerRepository.deleteProduct(productToDelete.id);
      onChanged();
    } catch {
      setActionError("No se pudo eliminar. Si tiene pedidos, ocultalo en su lugar.");
    } finally {
      setProductToDelete(null);
      setIsDeleting(false);
    }
  };

  if (products.length === 0) {
    return (
      <EmptyState
        illustration="basket"
        title="Todavía no cargaste productos"
        description="El camino más rápido: tocá el micrófono de arriba y decí qué tenés."
        action={
          <a href="#cargar-por-voz" className="btn btn-primary">
            <MicIcon size={18} />
            Cargar por voz
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {actionError && <Alert tone="error">{actionError}</Alert>}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => {
          const status = reviewStatus(p);
          return (
            <li key={p.id} className={`card flex flex-col overflow-hidden ${p.validado && !p.disponible ? "opacity-75" : ""}`}>
              <div className="relative aspect-[4/3] bg-surface-muted">
                <ProductImage src={p.imagen_url} sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw" iconSize={32} />
                <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.tone}`}>{status.label}</span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="font-display font-semibold leading-tight">{p.nombre}</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    <span className="font-semibold text-foreground tabular-nums">{formatPrice(p.precio)}</span> · {p.unidad}
                  </p>
                  {!p.validado && p.razon_rechazo && <p className="mt-2 text-sm text-danger">Motivo del rechazo: {p.razon_rechazo}</p>}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
                  {p.validado ? (
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.disponible}
                        aria-label={`${p.disponible ? "Ocultar" : "Mostrar"} ${p.nombre}`}
                        disabled={togglingId === p.id}
                        onClick={() => toggleAvailability(p)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${p.disponible ? "bg-action" : "bg-border-strong"} disabled:opacity-60`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.disponible ? "translate-x-5" : ""}`}
                        />
                      </button>
                      {p.disponible ? "Disponible" : "Oculto"}
                    </label>
                  ) : (
                    <span className="text-sm text-muted">Sin publicar</span>
                  )}

                  <button
                    type="button"
                    className="btn btn-ghost !p-2 text-muted hover:text-danger"
                    aria-label={`Eliminar ${p.nombre}`}
                    onClick={() => setProductToDelete({ id: p.id, name: p.nombre })}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title={productToDelete ? `¿Eliminar “${productToDelete.name}”?` : "¿Eliminar producto?"}
        description="El producto se eliminará de tu catálogo. Si ya tiene pedidos asociados, te recomendamos ocultarlo en su lugar."
        confirmText="Eliminar producto"
        isLoading={isDeleting}
      />
    </div>
  );
}
