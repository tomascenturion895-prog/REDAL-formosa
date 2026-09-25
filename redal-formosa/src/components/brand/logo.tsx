import Link from "next/link";

import { siteName, siteTagline } from "@/lib/navigation";

/** Marca: el toldo de un puesto de feria (la venta directa) junto al nombre. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" className="shrink-0">
      <rect width="512" height="512" rx="112" fill="var(--color-primary-700)" />
      <path d="M96 216h320l-28-88H124z" fill="var(--color-accent-300)" />
      <path
        d="M96 216c0 30 24 52 53 52s53-22 53-52c0 30 24 52 53 52s53-22 53-52c0 30 24 52 53 52s53-22 53-52"
        fill="var(--color-accent-400)"
      />
      <rect x="128" y="288" width="256" height="112" rx="12" fill="var(--color-neutral-50)" />
      <rect x="224" y="320" width="64" height="80" rx="8" fill="var(--color-ink-900)" />
    </svg>
  );
}

export function Logo({ descriptor = false }: { descriptor?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap" aria-label={`${siteName}, ir al inicio`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold sm:text-xl tracking-tight">
          <span className="text-action">RedAL</span> Formosa
        </span>
        {descriptor && <span className="mt-1 hidden text-xs text-muted xl:block">{siteTagline}</span>}
      </span>
    </Link>
  );
}
