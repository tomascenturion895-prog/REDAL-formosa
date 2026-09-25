"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { useAuth } from "@/lib/auth/auth-context";
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
      let replaceOtherStore = false;
      if (conflictsWithCart(items, producto)) {
        replaceOtherStore = window.confirm(
          "Tu carrito tiene productos de otro emprendimiento. Solo se puede comprar a uno por pedido. ¿Querés vaciarlo y agregar este?",
        );
        if (!replaceOtherStore) return false;
      }
      cartStore.dispatch(owner, { type: "add", producto, cantidad, replaceOtherStore });
      return true;
    },
    [items, owner],
  );

  const value = useMemo<CartContextType>(() => {
    const subtotal = sumSubtotal(items.map((i) => ({ precio: i.producto.precio, cantidad: i.cantidad })));
    const envio = estimarEnvio(items.length);
    return {
      items,
      emprendimientoId: items[0]?.producto.emprendimiento_id ?? null,
      addItem,
      removeItem: (productoId) => cartStore.dispatch(owner, { type: "remove", productoId }),
      updateQuantity: (productoId, cantidad) => cartStore.dispatch(owner, { type: "setQuantity", productoId, cantidad }),
      clearCart: () => cartStore.dispatch(owner, { type: "clear" }),
      subtotal,
      envio,
      total: subtotal + envio,
      itemCount: items.reduce((sum, i) => sum + i.cantidad, 0),
    };
  }, [items, addItem, owner]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
