"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { EmptyState } from "@/components/ui/empty-state";
import { CartIcon, UserIcon } from "@/components/ui/icons";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, subtotal, envio, total } = useCart();

  if (loading) return <div className="page-container py-section" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<CartIcon size={36} />}
          title="No hay nada para pagar"
          description="Agregá productos al carrito para armar tu pedido."
          action={
            <Link href="/productos" className="btn btn-primary">
              Ver productos
            </Link>
          }
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<UserIcon size={36} />}
          title="Ingresá para terminar tu compra"
          description="Tu carrito queda guardado. Iniciá sesión o creá una cuenta para hacer el pedido."
          action={
            <div className="flex gap-3">
              <Link href="/login" className="btn btn-primary">
                Ingresar
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Crear cuenta
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <h1 className="text-title pb-8">Finalizar pedido</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <CheckoutForm />

        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <h2 className="text-heading">Tu pedido</h2>

          <ul className="space-y-2 border-b border-border pb-4 text-sm">
            {items.map(({ producto, cantidad }) => (
              <li key={producto.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {cantidad} × {producto.nombre}
                </span>
                <span className="tabular-nums">{formatPrice(Number(producto.precio) * cantidad)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Productos</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Envío</dt>
              <dd className="tabular-nums">{formatPrice(envio)}</dd>
            </div>
          </dl>

          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(total)}</span>
          </div>

          <Link href="/carrito" className="block text-center text-sm font-medium text-link hover:underline">
            Volver al carrito
          </Link>
        </aside>
      </div>
    </div>
  );
}
