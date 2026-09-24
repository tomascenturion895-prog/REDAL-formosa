"use client";

import { CartBadge } from "@/components/cart/cart-badge";
import { UserMenu } from "./user-menu";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-3">
      <CartBadge />
      <UserMenu />
    </div>
  );
}
