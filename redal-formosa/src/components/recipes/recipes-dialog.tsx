"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import type { Recipe } from "@/lib/domain/recipes";
import { Alert } from "@/components/ui/alert";
import { CheckIcon, CloseIcon, StoreIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface RecipeProduct {
  id: string;
  nombre: string;
  unidad: string;
  precio: number;
  imagen_url: string | null;
  emprendimiento_id: string;
}

interface RecipesResult {
  recetas: Recipe[];
  productos: RecipeProduct[];
}

interface RecipesDialogProps {
  emprendimientoId: string;
  /** Acota las recetas a estos productos (por ejemplo, lo que hay en la cesta). */
  productIds?: string[];
  label?: string;
  className?: string;
}

/** "¿Qué puedo cocinar con esto?": abre un panel con 2 recetas y deja agregar sus ingredientes al carrito. */
export function RecipesDialog({ emprendimientoId, productIds, label = "¿Qué puedo cocinar con esto?", className = "btn btn-secondary" }: RecipesDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecipesResult | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emprendimientoId, productIds }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "No pudimos armar las recetas. Probá de nuevo.");
        return;
      }
      setResult(data as RecipesResult);
      setAdded(new Set());
    } catch {
      setError("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const start = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
    if (!result) void load();
  };

  const addIngredients = (recipe: Recipe, index: number) => {
    const byId = new Map(result?.productos.map((p) => [p.id, p]));
    for (const { productoId, cantidad } of recipe.ingredientes) {
      const p = byId.get(productoId);
      if (p) addItem({ id: p.id, nombre: p.nombre, precio: p.precio, unidad: p.unidad, imagen_url: p.imagen_url, emprendimiento_id: p.emprendimiento_id }, cantidad);
    }
    setAdded((prev) => new Set(prev).add(index));
  };

  const nameOf = (id: string) => result?.productos.find((p) => p.id === id)?.nombre ?? "Ingrediente";

  return (
    <>
      <button type="button" onClick={start} className={className}>
        {label}
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="recipes-title" className="fixed inset-0 z-[2000] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-sheet bg-surface p-5 shadow-pop sm:rounded-sheet sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="recipes-title" className="text-title">
                  Recetas de origen
                </h2>
                <p className="mt-1 text-sm text-muted">Ideas simples con lo que vende este emprendimiento.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="btn btn-ghost !p-2">
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {loading && (
                <div aria-busy="true" aria-label="Armando recetas" className="space-y-3">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              )}

              {error && (
                <div className="space-y-3">
                  <Alert tone="error">{error}</Alert>
                  <button type="button" onClick={load} className="btn btn-primary btn-sm">
                    Reintentar
                  </button>
                </div>
              )}

              {result?.recetas.map((recipe, index) => (
                <article key={recipe.titulo} className="space-y-3 rounded-card border border-border p-4">
                  <h3 className="font-display text-xl font-semibold">{recipe.titulo}</h3>
                  {recipe.descripcion && <p className="text-sm text-muted">{recipe.descripcion}</p>}

                  <div>
                    <p className="text-sm font-semibold">Con estos productos</p>
                    <ul className="mt-1 flex flex-wrap gap-2 text-sm">
                      {recipe.ingredientes.map((i) => (
                        <li key={i.productoId} className="rounded-full bg-success-soft px-3 py-1 text-success">
                          {i.cantidad} × {nameOf(i.productoId)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recipe.pasos.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold">Ver preparación</summary>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
                        {recipe.pasos.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </details>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button type="button" onClick={() => addIngredients(recipe, index)} disabled={added.has(index)} className="btn btn-primary btn-sm">
                      {added.has(index) ? (
                        <>
                          <CheckIcon size={16} /> Agregados al carrito
                        </>
                      ) : (
                        "Agregar ingredientes al carrito"
                      )}
                    </button>
                    {added.has(index) && (
                      <Link href="/carrito" className="btn btn-secondary btn-sm">
                        <StoreIcon size={16} /> Ir al carrito
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {result && <p className="mt-4 text-xs text-muted">Sugerencias generadas con IA: revisá alérgenos y cantidades a tu gusto.</p>}
          </div>
        </div>
      )}
    </>
  );
}
