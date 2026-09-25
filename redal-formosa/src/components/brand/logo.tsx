import Image from "next/image";
import Link from "next/link";

import { siteName } from "@/lib/navigation";

/** Ícono de marca: Círculo con la 'R' oficial de REDAL */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex shrink-0 items-center justify-center rounded-full overflow-hidden shadow-xs"
    >
      <Image
        src="/icon-192.png"
        alt="REDAL"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </div>
  );
}

/**
 * Logotipo oficial REDAL adaptado para el Topbar y Navbar.
 * Totalmente integrado: fondo transparente natural que se adapta tanto al modo claro como al modo oscuro
 * sin cajas ni fondos oscuros forzados en modo claro.
 */
export function Logo() {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-transform duration-150 active:scale-98"
      aria-label={`${siteName}, ir al inicio`}
    >
      <div className="flex items-center gap-2.5">
        <Image
          src="/brand/redal-logo.png"
          alt="REDAL"
          width={130}
          height={28}
          className="h-7 sm:h-8 w-auto object-contain transition-opacity duration-150 group-hover:opacity-90"
          priority
        />
        <span className="hidden sm:inline-flex items-center text-xs font-bold tracking-widest text-muted uppercase pl-2 border-l border-border select-none">
          Formosa
        </span>
      </div>
    </Link>
  );
}
