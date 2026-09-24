"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export function CartBadge() {
  const { itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <Link
        href="/carrito"
        className="rounded-control border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition-colors"
      >
        Carrito
      </Link>
    );
  }

  return (
    <Link
      href="/carrito"
      className="relative rounded-control bg-highlight px-3 py-2 text-sm font-medium text-on-highlight hover:opacity-90 transition-opacity"
    >
      Carrito
      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-white">
        {itemCount}
      </span>
    </Link>
  );
}
