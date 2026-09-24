"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ratingsService } from "@/lib/ratings/ratings-service";
import { StarRating } from "@/components/ratings/star-rating";
import { RatingForm } from "@/components/ratings/rating-form";
import { RatingsList } from "@/components/ratings/ratings-list";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { PageHeader } from "@/components/layout/page-header";
import type { Database } from "@/lib/supabase/types";

type Producto = Database["public"]["Tables"]["productos"]["Row"];

interface RatingStats {
  total_ratings: number;
  promedio_puntuacion: number;
}

export default function ProductoDetailPage() {
  const params = useParams();
  const productoId = params.id as string;
  const supabase = createClient();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [productoId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: prod, error: prodErr } = await supabase
        .from("productos")
        .select("*")
        .eq("id", productoId)
        .single();

      if (prodErr) throw prodErr;
      setProducto(prod);

      const stat = await ratingsService.getProductStats(productoId);
      setStats(stat);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando producto");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-section">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="page-container py-section">
        <div className="text-center">
          <p className="text-muted mb-4">Producto no encontrado</p>
          <a
            href="/emprendimientos"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Volver al catálogo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <PageHeader
        title={producto.nombre}
        description={producto.descripcion || ""}
      />

      <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-3">
        {/* Información del producto */}
        <div className="lg:col-span-2 space-y-6">
          {producto.imagen_url && (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-96 object-cover rounded-card border border-border"
            />
          )}

          <div className="rounded-card border border-border bg-surface p-6">
            <div className="mb-4">
              <p className="text-sm text-muted">Precio</p>
              <p className="text-3xl font-bold text-action mt-1">
                ${producto.precio}
              </p>
              <p className="text-sm text-muted mt-1">{producto.unidad}</p>
            </div>

            {/* Calificaciones */}
            {stats && stats.total_ratings > 0 ? (
              <div className="mb-6 p-4 rounded-control bg-surface-muted">
                <p className="text-sm text-muted mb-2">Calificación promedio</p>
                <div className="flex items-center gap-4">
                  <StarRating rating={stats.promedio_puntuacion} size="lg" />
                  <span className="text-sm text-muted">
                    Basado en {stats.total_ratings} calificación
                    {stats.total_ratings !== 1 ? "es" : ""}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-control bg-surface-muted">
                <p className="text-sm text-muted">Aún no tiene calificaciones</p>
              </div>
            )}
          </div>

          {/* Formulario de calificación */}
          <div className="rounded-card border border-border bg-surface p-6">
            <h2 className="text-heading mb-4">Califica este producto</h2>
            <RatingForm
              productoId={productoId}
              onSuccess={() => {
                loadData();
              }}
            />
          </div>

          {/* Lista de calificaciones */}
          <div className="rounded-card border border-border bg-surface p-6">
            <h2 className="text-heading mb-4">Calificaciones</h2>
            <RatingsList productoId={productoId} limit={20} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-surface p-6 sticky top-20">
            <p className="text-sm text-muted mb-3">Disponibilidad</p>
            <p className="font-semibold text-foreground mb-4">
              {producto.disponible ? "✓ Disponible" : "No disponible"}
            </p>

            <div className="mb-4">
              <WishlistButton productId={productoId} />
            </div>

            <a
              href="/emprendimientos"
              className="block text-center rounded-control bg-highlight px-4 py-3 font-medium text-on-highlight hover:opacity-90"
            >
              Ver más productos
            </a>

            <a
              href="/emprendimientos"
              className="block text-center mt-3 text-sm text-link hover:underline"
            >
              Volver al catálogo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
