// Lógica pura del carrito: sin React, sin localStorage, sin confirm(). Es la parte testeable.
// El carrito puede tener productos de varios emprendimientos: cada uno forma una "cesta" que se paga aparte.

import { estimarEnvio, subtotal as sumSubtotal } from "@/lib/domain/pricing";

export interface CartProduct {
  id: string;
  nombre: string;
  precio: number;
  unidad: string;
  imagen_url: string | null;
  emprendimiento_id: string;
}

export interface CartItem {
  producto: CartProduct;
  cantidad: number;
}

export const MAX_QUANTITY = 99;

export type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; producto: CartProduct; cantidad: number }
  | { type: "remove"; productoId: string }
  | { type: "setQuantity"; productoId: string; cantidad: number }
  | { type: "clearStore"; emprendimientoId: string }
  | { type: "clear" };

const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n)));

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;

    case "add": {
      const existing = items.find((i) => i.producto.id === action.producto.id);
      if (existing) {
        return items.map((i) =>
          i.producto.id === action.producto.id ? { ...i, cantidad: clamp(i.cantidad + action.cantidad) } : i,
        );
      }
      return [...items, { producto: action.producto, cantidad: clamp(action.cantidad) }];
    }

    case "clearStore":
      return items.filter((i) => i.producto.emprendimiento_id !== action.emprendimientoId);

    case "remove":
      return items.filter((i) => i.producto.id !== action.productoId);

    case "setQuantity":
      return action.cantidad <= 0
        ? items.filter((i) => i.producto.id !== action.productoId)
        : items.map((i) => (i.producto.id === action.productoId ? { ...i, cantidad: clamp(action.cantidad) } : i));

    case "clear":
      return [];
  }
}

/** Junta el carrito armado sin sesión con el que ya tenía la cuenta al ingresar: se suman las cantidades. */
export function mergeCarts(saved: CartItem[], incoming: CartItem[]): CartItem[] {
  if (incoming.length === 0) return saved;
  return incoming.reduce((acc, item) => cartReducer(acc, { type: "add", producto: item.producto, cantidad: item.cantidad }), saved);
}

export interface CartGroup {
  emprendimientoId: string;
  items: CartItem[];
  subtotal: number;
  envio: number;
  total: number;
  itemCount: number;
}

/** Una cesta por emprendimiento, en el orden en que se empezó a comprar en cada uno. */
export function groupByStore(items: readonly CartItem[]): CartGroup[] {
  const byStore = new Map<string, CartItem[]>();
  for (const item of items) {
    const id = item.producto.emprendimiento_id;
    byStore.set(id, [...(byStore.get(id) ?? []), item]);
  }
  return [...byStore].map(([emprendimientoId, lines]) => {
    const subtotal = sumSubtotal(lines.map((l) => ({ precio: l.producto.precio, cantidad: l.cantidad })));
    const envio = estimarEnvio(lines.length);
    return {
      emprendimientoId,
      items: lines,
      subtotal,
      envio,
      total: subtotal + envio,
      itemCount: lines.reduce((sum, l) => sum + l.cantidad, 0),
    };
  });
}
