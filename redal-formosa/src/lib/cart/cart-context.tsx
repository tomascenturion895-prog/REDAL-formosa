"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Database } from "@/lib/supabase/types";

type Producto = Database["public"]["Tables"]["productos"]["Row"];

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartContextType {
  items: CartItem[];
  emprendimientoId: string | null;
  addItem: (producto: Producto, cantidad: number) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [emprendimientoId, setEmprendimientoId] = useState<string | null>(null);

  // Cargar carrito del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    const savedEmpId = localStorage.getItem("cart_emprendimiento_id");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
        setEmprendimientoId(savedEmpId);
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
    if (emprendimientoId) {
      localStorage.setItem("cart_emprendimiento_id", emprendimientoId);
    }
  }, [items, emprendimientoId]);

  const addItem = (producto: Producto, cantidad: number) => {
    // Si el producto es de otro emprendimiento, limpiar carrito
    if (emprendimientoId && emprendimientoId !== producto.emprendimiento_id) {
      const confirmed = confirm(
        "Tu carrito tiene productos de otro emprendimiento. ¿Deseas reemplazarlos?"
      );
      if (!confirmed) return;
      setItems([]);
    }

    setEmprendimientoId(producto.emprendimiento_id);

    setItems((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { producto, cantidad }];
    });
  };

  const removeItem = (productoId: string) => {
    setItems((prev) => prev.filter((item) => item.producto.id !== productoId));
    if (items.length === 1) {
      setEmprendimientoId(null);
    }
  };

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setEmprendimientoId(null);
  };

  const total = items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        emprendimientoId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
