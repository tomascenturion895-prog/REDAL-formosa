"use client";

import React, { useState, useMemo } from "react";
import { Product, Producer } from "@/types";
import { ProductCard } from "./ProductCard";

interface CartItem {
  product: Product;
  quantity: number;
}

interface ProductCatalogProps {
  products: Product[];
  producer: Producer;
}

export function ProductCatalog({ products, producer }: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [onlyAgroecological, setOnlyAgroecological] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">("featured");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoria));
    return ["todos", ...Array.from(cats)];
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.variedad && p.variedad.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory =
          selectedCategory === "todos" || p.categoria === selectedCategory;

        const matchesAgro = !onlyAgroecological || p.esAgroecologico;

        return matchesSearch && matchesCategory && matchesAgro;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.precioMinorista - b.precioMinorista;
        if (sortBy === "price_desc") return b.precioMinorista - a.precioMinorista;
        return 0; // default featured order
      });
  }, [products, searchQuery, selectedCategory, onlyAgroecological, sortBy]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev[product.id];
      const newQty = existing ? existing.quantity + quantity : quantity;
      return {
        ...prev,
        [product.id]: { product, quantity: newQty },
      };
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const cartItems = Object.values(cart);
  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + item.product.precioMinorista * item.quantity,
    0
  );
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Construct WhatsApp order message
  const generateWhatsAppOrderLink = () => {
    let message = `¡Hola ${producer.nombre}! Quiero coordinar el siguiente pedido desde REDAL Formosa:\n\n`;
    cartItems.forEach((item) => {
      message += `• ${item.quantity} ${item.product.unidadMedida} de ${item.product.nombre} ($${(
        item.product.precioMinorista * item.quantity
      ).toLocaleString("es-AR")})\n`;
    });
    message += `\n*Total estimado: $${totalCartPrice.toLocaleString("es-AR")}*\n`;
    message += `\n¿En qué punto de entrega o día podríamos coordinar? Muchas gracias!`;

    return `https://wa.me/${producer.contacto.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="mt-8 space-y-6">
      {/* Search & Filter Controls Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-sm space-y-4">
        {/* Top search & Sort bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              aria-label="Buscar productos en el catálogo"
              placeholder="Buscar mandioca, acelga, tomate, miel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 whitespace-nowrap hidden sm:inline">
              Ordenar por:
            </span>
            <select
              aria-label="Ordenar productos"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "featured" | "price_asc" | "price_desc")
              }
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="featured">Destacados / Cosecha</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Agro Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1">
            <input
              type="checkbox"
              checked={onlyAgroecological}
              onChange={(e) => setOnlyAgroecological(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
            🌱 Solo Agroecológico
          </label>
        </div>
      </div>

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
          Catálogo Disponible
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {filteredProducts.length} productos
          </span>
        </h2>
        <span className="text-xs text-zinc-500">Precios directos del productor</span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              producerPhone={producer.contacto.whatsapp}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center bg-white dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 text-2xl">
            🧺
          </div>
          <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
            No se encontraron productos con esos filtros
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Probá limpiando el término de búsqueda o cambiando la categoría seleccionada.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("todos");
              setOnlyAgroecological(false);
            }}
            className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Sticky Fast Cart / Order Bar when items are added */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounce-short">
          <div className="rounded-2xl bg-zinc-900 text-white p-4 shadow-xl border border-emerald-500/40 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold">
                  {totalItemsCount}
                </span>
                <span className="text-xs font-bold">Tu pedido estimado</span>
              </div>
              <span className="text-sm font-black text-emerald-400">
                ${totalCartPrice.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOrderModal(true)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors"
              >
                Ver detalle ({cartItems.length})
              </button>

              <a
                href={generateWhatsAppOrderLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-emerald-700/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.05-1.07l-.29-.17-3.12.82.83-3.04-.19-.31a8.19 8.19 0 0 1-1.26-4.47c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3z" />
                </svg>
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Resumen de tu Pedido
              </h3>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800 pb-2"
                >
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {item.product.nombre}
                    </span>
                    <span className="text-zinc-500 block">
                      {item.quantity} {item.product.unidadMedida} x $
                      {item.product.precioMinorista.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ${(item.product.precioMinorista * item.quantity).toLocaleString("es-AR")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                Total Estimado:
              </span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                ${totalCartPrice.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200"
              >
                Seguir mirando
              </button>
              <a
                href={generateWhatsAppOrderLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                Enviar a WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
