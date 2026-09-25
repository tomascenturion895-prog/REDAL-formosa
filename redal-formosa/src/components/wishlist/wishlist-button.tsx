"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-context";
import { useUserScopedState } from "@/lib/auth/use-user-scoped-state";
import { useAsync } from "@/lib/hooks/use-async";
import { wishlistRepository } from "@/lib/wishlist/wishlist-repository";
import { HeartIcon } from "@/components/ui/icons";

interface WishlistButtonProps {
  productId: string;
  /** Si el listado ya conoce el estado, se pasa para evitar una consulta por tarjeta. */
  favorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  variant?: "icon" | "full";
}

export function WishlistButton({ productId, favorite, onToggle, variant = "icon" }: WishlistButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [own, setOwn] = useUserScopedState<boolean | null>(() => null);
  const [busy, setBusy] = useState(false);

  // Solo consulta por su cuenta cuando el padre no le informó el estado.
  const { data: fetched } = useAsync(() => wishlistRepository.isFavorite(user!.id, productId), [user?.id, productId], {
    enabled: favorite === undefined && Boolean(user),
    scope: user?.id,
  });
  const isFavorite = favorite ?? own ?? fetched ?? false;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    const next = !isFavorite;
    setBusy(true);
    try {
      if (next) await wishlistRepository.add(user.id, productId);
      else await wishlistRepository.remove(user.id, productId);
      setOwn(next);
      onToggle?.(next);
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const label = isFavorite ? "Quitar de favoritos" : "Guardar en favoritos";

  if (variant === "full") {
    return (
      <button type="button" onClick={toggle} disabled={busy} aria-pressed={isFavorite} className="btn btn-secondary w-full">
        <HeartIcon filled={isFavorite} className={isFavorite ? "text-danger" : ""} />
        {isFavorite ? "En tus favoritos" : "Guardar en favoritos"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-foreground shadow-card transition-colors hover:bg-surface disabled:opacity-60"
    >
      <HeartIcon size={18} filled={isFavorite} className={isFavorite ? "text-danger" : ""} />
    </button>
  );
}
