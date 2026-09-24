"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/cart-context";
import type { Database } from "@/lib/supabase/types";
import { PageHeader } from "@/components/layout/page-header";

type Emprendimiento = Database["public"]["Tables"]["emprendimientos"]["Row"];
type Producto = Database["public"]["Tables"]["productos"]["Row"];

export default function EmprendimientoPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const { addItem } = useCart();
  const [emprendimiento, setEmprendimiento] = useState<Emprendimiento | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: emp, error: empErr } = await supabase
        .from("emprendimientos")
        .select("*")
        .eq("id", id)
        .single();

      if (empErr) throw empErr;
      setEmprendimiento(emp);

      const { data: prods, error: prodsErr } = await supabase
        .from("productos")
        .select("*")
        .eq("emprendimiento_id", id)
        .eq("disponible", true);

      if (prodsErr) throw prodsErr;
      setProductos(prods || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!emprendimiento) {
    return (
      <div className="page-container py-section text-center">
        <p className="text-muted">Emprendimiento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <PageHeader
        title={emprendimiento.nombre}
        description={emprendimiento.descripcion || ""}
        actions={
          <a
            href={`mailto:${emprendimiento.email}`}
            className="rounded-control bg-action px-4 py-2 text-sm font-medium text-on-action hover:bg-action-hover"
          >
            Contactar
          </a>
        }
      />

      {emprendimiento.telefono && (
        <p className="mb-6 text-sm text-muted">
          <span className="font-medium">Teléfono:</span> {emprendimiento.telefono}
        </p>
      )}

      <div className="mb-8">
        <h2 className="text-heading mb-4">Productos ({productos.length})</h2>

        {productos.length === 0 ? (
          <div className="rounded-card border border-border bg-surface-muted p-8 text-center">
            <p className="text-muted">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="rounded-card border border-border bg-surface overflow-hidden shadow-card hover:shadow-pop transition-shadow"
              >
                {producto.imagen_url && (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-40 object-cover"
                  />
                )}

                <div className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-muted mt-1 line-clamp-2">
                    {producto.descripcion}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold text-action text-lg">
                      ${producto.precio}
                    </span>
                    <span className="text-xs text-muted bg-surface-muted px-2 py-1 rounded-control">
                      {producto.unidad}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addItem(producto, 1);
                      setAddedProductId(producto.id);
                      setTimeout(() => setAddedProductId(null), 2000);
                    }}
                    className={`mt-4 w-full rounded-control px-3 py-2 text-sm font-medium transition-all ${
                      addedProductId === producto.id
                        ? "bg-success text-on-success"
                        : "bg-highlight text-on-highlight hover:opacity-90"
                    }`}
                  >
                    {addedProductId === producto.id ? "✓ Agregado" : "Agregar al carrito"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
