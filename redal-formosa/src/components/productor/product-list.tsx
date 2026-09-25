"use client";

import { useState } from "react";

import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { producerRepository, type Product } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ProductListProps {
  emprendimientoId: string;
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

export function ProductList({ emprendimientoId }: ProductListProps) {
  const { data: products, error: loadError, loading, reload } = useAsync(
    () => producerRepository.listProducts(emprendimientoId),
    [emprendimientoId],
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const run = async (action: () => Promise<void>, failure: string) => {
    setActionError(null);
    try {
      await action();
      reload();
    } catch {
      setActionError(failure);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await run(() => producerRepository.deleteProduct(productToDelete.id), "No se pudo eliminar. Si tiene pedidos, ocultalo en su lugar.");
      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !products) return <div aria-busy="true" className="h-24" />;
  if (loadError) return <Alert tone="error">No pudimos cargar tus productos.</Alert>;

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<PackageIcon size={36} />}
        title="Todavía no cargaste productos"
        description="Agregá el primero con el botón “Nuevo producto”."
      />
    );
  }

  return (
    <div className="space-y-3">
      {actionError && <Alert tone="error">{actionError}</Alert>}

      <ul className="space-y-3">
        {products.map((p) => {
          const status = reviewStatus(p);
          return (
            <li key={p.id} className="card flex flex-wrap gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                <ProductImage src={p.imagen_url} sizes="80px" iconSize={26} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-semibold">{p.nombre}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.tone}`}>{status.label}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {formatPrice(p.precio)} · {p.unidad}
                </p>
                {!p.validado && p.razon_rechazo && <p className="mt-2 text-sm text-danger">Motivo del rechazo: {p.razon_rechazo}</p>}
              </div>

              <div className="flex items-start gap-2">
                {p.validado && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => run(() => producerRepository.setProductAvailability(p.id, !p.disponible), "No pudimos actualizar el producto.")}
                  >
                    {p.disponible ? "Ocultar" : "Mostrar"}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setProductToDelete({ id: p.id, name: p.nombre })}
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title={productToDelete ? `¿Eliminar “${productToDelete.name}”?` : "¿Eliminar producto?"}
        description="El producto se eliminará de tu catálogo. Si ya tiene pedidos asociados, te recomendamos ocultarlo en su lugar."
        confirmText="Eliminar producto"
        isLoading={isDeleting}
      />
    </div>
  );
}
