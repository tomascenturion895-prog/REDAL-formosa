"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { groupByStore, type CartGroup, type CartItem, type CartProduct } from "./cart-reducer";
import { cartStore } from "./cart-store";

export type { CartGroup, CartItem, CartProduct };

interface CartContextType {
  /** false mientras se resuelve la sesión: todavía no se sabe de quién es el carrito. */
  ready: boolean;
  items: CartItem[];
  /** Una cesta por emprendimiento: cada una se paga por separado. */
  groups: CartGroup[];
  /** Devuelve false si todavía no se sabe de quién es el carrito (sesión en curso). */
  addItem: (producto: CartProduct, cantidad?: number) => boolean;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  /** Vacía solo la cesta de un emprendimiento (después de pagarla). */
  clearStore: (emprendimientoId: string) => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  // Mientras se resuelve la sesión no se sabe de quién es el carrito: no se muestra ni se toca ninguno.
  const owner = loading ? undefined : (user?.id ?? null);

  const items = useSyncExternalStore(cartStore.subscribe, () => cartStore.getSnapshot(owner), cartStore.getServerSnapshot);

  const previousOwner = useRef<typeof owner>(undefined);
  useEffect(() => {
    cartStore.dropLegacy();
    // Solo al pasar de invitado a una cuenta (login): un cierre de sesión nunca traslada nada.
    if (previousOwner.current === null && typeof owner === "string") cartStore.adoptGuestCart(owner);
    if (owner !== undefined) previousOwner.current = owner;
  }, [owner]);

  const addItem = useCallback(
    (producto: CartProduct, cantidad = 1) => {
      if (owner === undefined) return false;
      cartStore.dispatch(owner, { type: "add", producto, cantidad });
      return true;
    },
    [owner],
  );

  const value = useMemo<CartContextType>(
    () => ({
      ready: owner !== undefined,
      items,
      groups: groupByStore(items),
      addItem,
      removeItem: (productoId) => cartStore.dispatch(owner, { type: "remove", productoId }),
      updateQuantity: (productoId, cantidad) => cartStore.dispatch(owner, { type: "setQuantity", productoId, cantidad }),
      clearCart: () => cartStore.dispatch(owner, { type: "clear" }),
      clearStore: (emprendimientoId) => cartStore.dispatch(owner, { type: "clearStore", emprendimientoId }),
      itemCount: items.reduce((sum, i) => sum + i.cantidad, 0),
    }),
    [items, addItem, owner],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
