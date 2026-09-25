"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  producerPhone?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  producerPhone = "5493704589214",
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock =
    product.stockEstado === "agotado" ||
    product.stockEstado === "proxima_cosecha";

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const whatsappDirectUrl = `https://wa.me/${producerPhone}?text=${encodeURIComponent(
    `Hola! Te consulto por el producto "${product.nombre}" (${quantity} ${product.unidadMedida}) visto en REDAL Formosa.`
  )}`;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700">
      <div>
        {/* Product Image & Badges */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={product.fotoUrl}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
            {product.esAgroecologico && (
              <Badge variant="success" size="sm" className="shadow-sm">
                🌱 Agroecológico
              </Badge>
            )}

            {product.stockEstado === "disponible" && (
              <Badge variant="primary" size="sm">
                En Stock
              </Badge>
            )}
            {product.stockEstado === "stock_bajo" && (
              <Badge variant="warning" size="sm">
                Últimas un.
              </Badge>
            )}
            {product.stockEstado === "proxima_cosecha" && (
              <Badge variant="info" size="sm">
                Próx. Cosecha
              </Badge>
            )}
          </div>

          {/* Bottom tag over image */}
          {product.cosechaReciente && (
            <div className="absolute bottom-2 left-2.5">
              <span className="rounded-md bg-emerald-800/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                Cosecha Reciente
              </span>
            </div>
          )}
        </div>

        {/* Content details */}
        <div className="p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {product.categoria.replace("_", " ")}
            </span>
            {product.diasCosecha && (
              <span className="text-[10px] text-zinc-400 font-medium">
                Cosecha: {product.diasCosecha.join(", ")}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {product.nombre}
          </h3>

          {product.variedad && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-1 mt-0.5">
              {product.variedad}
            </p>
          )}

          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
            {product.descripcion}
          </p>

          {/* Pricing area */}
          <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Precio:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">
                    ${product.precioMinorista.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    / {product.unidadMedida}
                  </span>
                </div>
              </div>

              {/* Wholesale Tier Notice */}
              {product.preciosMayoristas && product.preciosMayoristas.length > 0 && (
                <div className="text-right">
                  <span className="inline-block rounded bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                    Mayorista B2B
                  </span>
                  <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    ${product.preciosMayoristas[0].precioUnitario.toLocaleString("es-AR")} / {product.unidadMedida}
                  </div>
                  <span className="text-[9px] text-zinc-400 block">
                    (Mín. {product.preciosMayoristas[0].minimoUnidades} {product.unidadMedida})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Footer & Actions */}
      <div className="p-4 sm:p-5 pt-0">
        {!isOutOfStock ? (
          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1">
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 text-sm font-bold transition-colors"
                aria-label="Restar uno"
              >
                −
              </button>
              <span className="w-8 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 text-sm font-bold transition-colors"
                aria-label="Sumar uno"
              >
                +
              </button>
            </div>

            {/* Add or Order Action Button */}
            <button
              type="button"
              onClick={handleAdd}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-white transition-all shadow-sm ${
                added
                  ? "bg-emerald-700 scale-95"
                  : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
              }`}
            >
              {added ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ¡Agregado!
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Sumar al pedido
                </>
              )}
            </button>
          </div>
        ) : (
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            Avisarme próxima cosecha
          </a>
        )}
      </div>
    </article>
  );
}
