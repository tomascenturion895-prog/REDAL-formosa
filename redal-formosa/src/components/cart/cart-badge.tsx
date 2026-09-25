"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart/cart-context";
import { CartIcon } from "@/components/ui/icons";

export function CartBadge() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/carrito"
      aria-label={itemCount > 0 ? `Carrito, ${itemCount} productos` : "Carrito"}
      className="btn btn-ghost relative !p-2.5"
    >
      <CartIcon />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-highlight px-1 text-xs font-bold text-on-highlight">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
