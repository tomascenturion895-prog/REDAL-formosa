"use client";

import Link from "next/link";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { CheckoutStepper } from "@/components/payment/checkout-stepper";
import { PaymentTrust } from "@/components/payment/payment-methods";
import { EmptyState } from "@/components/ui/empty-state";
import { CartIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";

export default function CarritoPage() {
  const { ready, items, emprendimientoId, removeItem, updateQuantity, clearCart, subtotal, envio, total } = useCart();
  const { data: emprendimiento } = useAsync(() => catalogRepository.getEmprendimiento(emprendimientoId!), [emprendimientoId], {
    enabled: Boolean(emprendimientoId),
  });

  if (!ready) return <div className="page-container py-section" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<CartIcon size={36} />}
          title="Tu carrito está vacío"
          description="Elegí productos de un emprendimiento y armá tu pedido."
          action={
            <Link href="/productos" className="btn btn-primary">
              Ver productos
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <CheckoutStepper current={0} />
      <div className="flex flex-wrap items-end justify-between gap-2 pb-8">
        <div>
          <h1 className="text-title">Tu carrito</h1>
          {emprendimiento && <p className="mt-1 text-muted">Pedido a {emprendimiento.nombre}</p>}
        </div>
        <button type="button" onClick={clearCart} className="text-sm font-medium text-muted hover:text-danger">
          Vaciar carrito
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-3">
          {items.map(({ producto, cantidad }) => (
            <li key={producto.id} className="card flex gap-4 p-4">
              <Link href={`/productos/${producto.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                <ProductImage src={producto.imagen_url} sizes="96px" iconSize={28} />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/productos/${producto.id}`} className="font-display font-semibold hover:text-action">
                      {producto.nombre}
                    </Link>
                    <p className="text-sm text-muted">
                      {formatPrice(producto.precio)} · {producto.unidad}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(producto.id)}
                    aria-label={`Quitar ${producto.nombre} del carrito`}
                    className="btn btn-ghost !p-2 text-muted hover:text-danger"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${producto.nombre}`}>
                    <button type="button" className="btn btn-secondary !p-1.5" onClick={() => updateQuantity(producto.id, cantidad - 1)} aria-label="Restar una unidad">
                      <MinusIcon size={14} />
                    </button>
                    <span className="w-9 text-center font-semibold tabular-nums">{cantidad}</span>
                    <button type="button" className="btn btn-secondary !p-1.5" onClick={() => updateQuantity(producto.id, cantidad + 1)} aria-label="Sumar una unidad">
                      <PlusIcon size={14} />
                    </button>
                  </div>
                  <p className="font-display text-lg font-bold tabular-nums">{formatPrice(Number(producto.precio) * cantidad)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <h2 className="text-heading">Resumen</h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Productos</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Envío estimado</dt>
              <dd className="font-medium tabular-nums">{formatPrice(envio)}</dd>
            </div>
          </dl>

          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(total)}</span>
          </div>

          <Link href="/checkout" className="btn btn-primary w-full !py-3">
            Continuar con el pedido
          </Link>
          <PaymentTrust />
          <Link href="/productos" className="block text-center text-sm font-medium text-link hover:underline">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
