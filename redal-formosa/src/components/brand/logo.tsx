import Image from "next/image";
import Link from "next/link";

import { siteName } from "@/lib/navigation";

/** Ícono de marca: La 'R' con flecha ascendente */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex shrink-0 items-center justify-center rounded-lg bg-[#14261c] p-1 shadow-xs border border-white/10"
    >
      <Image
        src="/brand/redal-mark.png"
        alt="REDAL Mark"
        width={61}
        height={67}
        className="h-full w-auto object-contain"
        priority
      />
    </div>
  );
}

/**
 * Logotipo oficial REDAL adaptado para el Topbar y Navbar.
 * Integra la imagen oficial de marca optimizada para contrastar y encajar perfecto.
 */
export function Logo({
  variant = "badge",
}: {
  variant?: "badge" | "clean";
  descriptor?: boolean;
} = {}) {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-transform duration-150 active:scale-98"
      aria-label={`${siteName}, ir al inicio`}
    >
      {variant === "badge" ? (
        <div className="flex items-center gap-2.5 rounded-xl bg-[#14261c] px-3.5 py-1.5 border border-[#223d2e] shadow-xs group-hover:border-action/60 group-hover:shadow-md transition-all duration-200">
          <Image
            src="/brand/redal-logo.png"
            alt="REDAL"
            width={124}
            height={27}
            className="h-6 sm:h-7 w-auto object-contain drop-shadow-xs"
            priority
          />
          <span className="hidden sm:inline-flex items-center text-[10px] font-bold tracking-widest text-[#2fa8de] uppercase pl-2 border-l border-white/15">
            Formosa
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Image
            src="/brand/redal-logo.png"
            alt="REDAL Formosa"
            width={130}
            height={28}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>
      )}
    </Link>
  );
}
