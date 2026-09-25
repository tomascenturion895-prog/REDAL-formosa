"use client";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "@/components/ui/icons";

/** Vuelve a la pantalla anterior; si la persona llegó directo a esta página, va al inicio. */
export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-1.5 rounded-control py-1.5 pr-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon size={18} />
      Volver
    </button>
  );
}
