// Lógica pura del carrito: sin React, sin localStorage, sin confirm(). Es la parte testeable.

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
  | { type: "add"; producto: CartProduct; cantidad: number; replaceOtherStore?: boolean }
  | { type: "remove"; productoId: string }
  | { type: "setQuantity"; productoId: string; cantidad: number }
  | { type: "clear" };

const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n)));

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;

    case "add": {
      const base = action.replaceOtherStore ? [] : items;
      const existing = base.find((i) => i.producto.id === action.producto.id);
      if (existing) {
        return base.map((i) =>
          i.producto.id === action.producto.id ? { ...i, cantidad: clamp(i.cantidad + action.cantidad) } : i,
        );
      }
      return [...base, { producto: action.producto, cantidad: clamp(action.cantidad) }];
    }

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

/** true si agregar este producto obliga a vaciar el carrito (es de otro emprendimiento). */
export function conflictsWithCart(items: CartItem[], producto: CartProduct): boolean {
  return items.length > 0 && items[0].producto.emprendimiento_id !== producto.emprendimiento_id;
}
