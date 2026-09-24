"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { CheckoutForm } from "@/components/checkout/checkout-form";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const monto = parseFloat(searchParams.get("monto") || "0");
  const direccion = decodeURIComponent(searchParams.get("direccion") || "");

  if (loading) {
    return <div className="page-container py-section text-center">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="page-container py-section">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-title mb-4">Inicia sesión para continuar</h1>
          <p className="text-muted mb-6">Necesitas estar logueado para hacer una compra.</p>
          <a
            href="/login"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Ir a login
          </a>
        </div>
      </div>
    );
  }

  if (!monto || !direccion) {
    return (
      <div className="page-container py-section">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-title mb-4">Datos incompletos</h1>
          <p className="text-muted mb-6">Vuelve al carrito para completar tu compra.</p>
          <a
            href="/carrito"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Volver al carrito
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-title mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckoutForm
              monto={monto}
              direccion={direccion}
              onSuccess={(pedidoId) => {
                router.push(`/confirmacion?pedido=${pedidoId}`);
              }}
            />
          </div>

          <div className="rounded-card border border-border bg-surface p-6 h-fit">
            <h2 className="text-heading mb-4">Resumen del pedido</h2>

            <div className="space-y-3 text-sm mb-4 pb-4 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted">Monto total</span>
                <span className="font-semibold">${monto.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted text-xs mb-1">Dirección de entrega</p>
                <p className="font-medium text-foreground line-clamp-3">{direccion}</p>
              </div>
            </div>

            <a
              href="/carrito"
              className="mt-6 block text-center text-sm text-link hover:underline"
            >
              Volver al carrito
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="page-container py-section text-center">Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
