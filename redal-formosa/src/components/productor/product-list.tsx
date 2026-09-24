"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

interface ProductListProps {
  emprendimientoId: string;
}

type Producto = Database["public"]["Tables"]["productos"]["Row"];

export function ProductList({ emprendimientoId }: ProductListProps) {
  const supabase = createClient();
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [emprendimientoId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("productos")
        .select("*")
        .eq("emprendimiento_id", emprendimientoId);

      if (err) throw err;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const { error: err } = await supabase
        .from("productos")
        // @ts-ignore
        .update({ disponible: !currentStatus })
        .eq("id", productId);

      if (err) throw err;
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
      const { error: err } = await supabase
        .from("productos")
        .delete()
        .eq("id", productId);

      if (err) throw err;
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted">Cargando productos...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface-muted p-6 text-center">
        <p className="text-muted">No hay productos aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-card border border-border bg-surface p-4 flex gap-4 items-start"
          >
            {product.imagen_url && (
              <img
                src={product.imagen_url}
                alt={product.nombre}
                className="w-24 h-24 object-cover rounded-control flex-shrink-0"
              />
            )}

            <div className="flex-1">
              <h4 className="font-medium text-foreground">{product.nombre}</h4>
              <p className="text-sm text-muted mt-1">{product.descripcion}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="font-semibold text-action">
                  ${product.precio} / {product.unidad}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    product.disponible
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning"
                  }`}
                >
                  {product.disponible ? "Disponible" : "No disponible"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleAvailability(product.id, product.disponible)}
                className="text-xs rounded-control border border-border px-3 py-1 text-foreground hover:bg-surface-muted transition-colors"
              >
                {product.disponible ? "Ocultar" : "Mostrar"}
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="text-xs rounded-control border border-danger text-danger px-3 py-1 hover:bg-danger-soft transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
