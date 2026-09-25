"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { estimarEnvio, subtotal as sumSubtotal } from "@/lib/domain/pricing";
import { conflictsWithCart, type CartItem, type CartProduct } from "./cart-reducer";
import { cartStore } from "./cart-store";

export type { CartItem, CartProduct };

interface CartContextType {
  items: CartItem[];
  emprendimientoId: string | null;
  /** Devuelve false si la persona decidió no vaciar un carrito de otro emprendimiento. */
  addItem: (producto: CartProduct, cantidad?: number) => boolean;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  subtotal: number;
  envio: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);

  const addItem = useCallback(
    (producto: CartProduct, cantidad = 1) => {
      let replaceOtherStore = false;
      if (conflictsWithCart(items, producto)) {
        replaceOtherStore = window.confirm(
          "Tu carrito tiene productos de otro emprendimiento. Solo se puede comprar a uno por pedido. ¿Querés vaciarlo y agregar este?",
        );
        if (!replaceOtherStore) return false;
      }
      cartStore.dispatch({ type: "add", producto, cantidad, replaceOtherStore });
      return true;
    },
    [items],
  );

  const value = useMemo<CartContextType>(() => {
    const subtotal = sumSubtotal(items.map((i) => ({ precio: i.producto.precio, cantidad: i.cantidad })));
    const envio = estimarEnvio(items.length);
    return {
      items,
      emprendimientoId: items[0]?.producto.emprendimiento_id ?? null,
      addItem,
      removeItem: (productoId) => cartStore.dispatch({ type: "remove", productoId }),
      updateQuantity: (productoId, cantidad) => cartStore.dispatch({ type: "setQuantity", productoId, cantidad }),
      clearCart: () => cartStore.dispatch({ type: "clear" }),
      subtotal,
      envio,
      total: subtotal + envio,
      itemCount: items.reduce((sum, i) => sum + i.cantidad, 0),
    };
  }, [items, addItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
