"use client";

import Link from "next/link";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { CheckoutStepper } from "@/components/payment/checkout-stepper";
import { RecipesDialog } from "@/components/recipes/recipes-dialog";
import { PaymentTrust } from "@/components/payment/payment-methods";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { CartIcon, MinusIcon, PlusIcon, StoreIcon, TrashIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";

export default function CarritoPage() {
  const { ready, groups, removeItem, updateQuantity, clearCart, clearStore } = useCart();
  const storeIds = groups.map((g) => g.emprendimientoId);
  const { data: names } = useAsync(() => catalogRepository.getEmprendimientoNames(storeIds), [storeIds.join(",")], {
    enabled: storeIds.length > 0,
  });

  if (!ready) return <div className="page-container py-section" aria-busy="true" />;

  if (groups.length === 0) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<CartIcon size={36} />}
          title="Tu carrito está vacío"
          description="Elegí productos de uno o más emprendimientos y armá tu pedido."
          action={
            <Link href="/productos" className="btn btn-primary">
              Ver productos
            </Link>
          }
        />
      </div>
    );
  }

  const multiple = groups.length > 1;

  return (
    <div className="page-container py-section">
      <CheckoutStepper current={0} />
      <div className="flex flex-wrap items-end justify-between gap-2 pb-6">
        <h1 className="text-title">Tu carrito</h1>
        <button type="button" onClick={clearCart} className="text-sm font-medium text-muted hover:text-danger">
          Vaciar todo
        </button>
      </div>

      {multiple && (
        <Alert tone="info" className="mb-6">
          Tenés productos de {groups.length} emprendimientos. Cada uno prepara y entrega su pedido por separado, así que pagás una cesta a la vez.
        </Alert>
      )}

      <div className="space-y-10">
        {groups.map((group) => {
          const storeName = names?.[group.emprendimientoId];
          return (
            <section key={group.emprendimientoId} aria-label={`Cesta de ${storeName ?? "emprendimiento"}`} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-heading">
                  <StoreIcon size={20} className="text-action" />
                  {storeName ? (
                    <Link href={`/emprendimientos/${group.emprendimientoId}`} className="hover:text-action">
                      {storeName}
                    </Link>
                  ) : (
                    "Emprendimiento"
                  )}
                </h2>
                {multiple && (
                  <button type="button" onClick={() => clearStore(group.emprendimientoId)} className="text-sm font-medium text-muted hover:text-danger">
                    Vaciar esta cesta
                  </button>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <ul className="space-y-3">
                  {group.items.map(({ producto, cantidad }) => (
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
                  <h3 className="text-heading">{multiple ? "Resumen de esta cesta" : "Resumen"}</h3>

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Productos</dt>
                      <dd className="font-medium tabular-nums">{formatPrice(group.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Envío estimado</dt>
                      <dd className="font-medium tabular-nums">{formatPrice(group.envio)}</dd>
                    </div>
                  </dl>

                  <div className="flex items-baseline justify-between border-t border-border pt-4">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(group.total)}</span>
                  </div>

                  <Link href={`/checkout?cesta=${group.emprendimientoId}`} className="btn btn-primary w-full !py-3">
                    {multiple ? "Pagar esta cesta" : "Continuar con el pedido"}
                  </Link>
                  <PaymentTrust />
                  <RecipesDialog
                    emprendimientoId={group.emprendimientoId}
                    productIds={group.items.map((i) => i.producto.id)}
                    label="¿Qué puedo cocinar con esto?"
                    className="btn btn-ghost btn-sm w-full text-action"
                  />
                </aside>
              </div>
            </section>
          );
        })}
      </div>

      <div className="pt-8 text-center">
        <Link href="/productos" className="text-sm font-medium text-link hover:underline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
