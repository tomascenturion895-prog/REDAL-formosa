"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Emprendimiento = Database["public"]["Tables"]["emprendimientos"]["Row"];

export default function CarroPage() {
  const { items, emprendimientoId, removeItem, updateQuantity, clearCart, total } = useCart();
  const supabase = createClient();
  const [emprendimiento, setEmprendimiento] = useState<Emprendimiento | null>(null);
  const [envio, setEnvio] = useState(0);
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emprendimientoId) {
      loadEmprendimiento();
    }
  }, [emprendimientoId]);

  const loadEmprendimiento = async () => {
    if (!emprendimientoId) return;
    try {
      const { data, error: err } = await supabase
        .from("emprendimientos")
        .select("*")
        .eq("id", emprendimientoId)
        .single();

      if (err) throw err;
      setEmprendimiento(data);
    } catch (err) {
      console.error("Error cargando emprendimiento:", err);
    }
  };

  const calcularEnvio = () => {
    if (!emprendimiento || !direccionEntrega) {
      setEnvio(0);
      return;
    }

    // Cálculo simple de envío basado en la cantidad de items
    // En futuro, usar PostGIS para calcular distancia real
    const envioBase = 100; // ARS
    const envioXitem = 50;
    const totalEnvio = envioBase + items.length * envioXitem;
    setEnvio(totalEnvio);
  };

  if (items.length === 0) {
    return (
      <div className="page-container py-section">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-title mb-4">Tu carrito está vacío</h1>
          <p className="text-muted mb-6">
            Explora nuestro catálogo y agrega productos a tu carrito
          </p>
          <Link
            href="/emprendimientos"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Ver emprendimientos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <h1 className="text-title mb-8">Mi carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items del carrito */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.producto.id}
                className="rounded-card border border-border bg-surface p-4 flex gap-4"
              >
                {item.producto.imagen_url && (
                  <img
                    src={item.producto.imagen_url}
                    alt={item.producto.nombre}
                    className="w-24 h-24 object-cover rounded-control flex-shrink-0"
                  />
                )}

                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.producto.nombre}</h3>
                  <p className="text-sm text-muted mt-1">${item.producto.precio}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.producto.id, Math.max(1, item.cantidad - 1))
                      }
                      className="px-2 py-1 rounded-control border border-border text-sm hover:bg-surface-muted"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                      className="px-2 py-1 rounded-control border border-border text-sm hover:bg-surface-muted"
                    >
                      +
                    </button>
                    <span className="flex-1 text-right font-semibold text-action">
                      ${item.producto.precio * item.cantidad}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.producto.id)}
                  className="text-sm text-danger hover:text-danger-hover font-medium self-start"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={clearCart}
            className="mt-6 text-sm text-muted hover:text-foreground font-medium"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen y checkout */}
        <div className="rounded-card border border-border bg-surface p-6 h-fit sticky top-20">
          <h2 className="text-heading mb-4">Resumen</h2>

          {emprendimiento && (
            <div className="mb-4 p-3 rounded-control bg-surface-muted text-sm">
              <p className="font-medium text-foreground">{emprendimiento.nombre}</p>
              {emprendimiento.telefono && (
                <p className="text-muted text-xs mt-1">{emprendimiento.telefono}</p>
              )}
            </div>
          )}

          <div className="space-y-2 mb-4 pb-4 border-b border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dirección de entrega
              </label>
              <input
                type="text"
                value={direccionEntrega}
                onChange={(e) => setDireccionEntrega(e.target.value)}
                placeholder="Tu dirección"
                className="w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                onClick={calcularEnvio}
                className="mt-2 w-full text-xs rounded-control border border-border px-2 py-1 text-foreground hover:bg-surface-muted"
              >
                Calcular envío
              </button>
            </div>

            {envio > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Envío</span>
                <span className="font-medium">${envio.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between mb-6 text-lg font-semibold">
            <span>Total</span>
            <span className="text-action">${(total + envio).toFixed(2)}</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-control bg-danger-soft text-sm text-danger">
              {error}
            </div>
          )}

          <button
            onClick={() => {
              if (!direccionEntrega) {
                setError("Ingresa una dirección de entrega");
                return;
              }
              if (envio === 0) {
                setError("Calcula el costo de envío");
                return;
              }
              // Redirigir a checkout (próximo paso)
              window.location.href = `/checkout?monto=${total + envio}&direccion=${encodeURIComponent(direccionEntrega)}`;
            }}
            disabled={loading}
            className="w-full rounded-control bg-highlight px-4 py-3 font-medium text-on-highlight hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Procesando..." : "Proceder al pago"}
          </button>

          <Link
            href="/emprendimientos"
            className="block text-center mt-3 text-sm text-link hover:underline"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
