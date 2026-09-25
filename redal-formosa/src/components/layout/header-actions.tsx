"use client";

import { CartBadge } from "@/components/cart/cart-badge";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <ThemeToggle />
      <CartBadge />
      <UserMenu />
    </div>
  );
}
