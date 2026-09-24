import Link from "next/link";

import { siteName } from "@/lib/navigation";

import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="page-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-action">
          {siteName}
        </Link>
        <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <NavLinks />
        </div>
        <Link
          href="/ingresar"
          className="rounded-control bg-action px-4 py-2 text-sm font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover"
        >
          Ingresar
        </Link>
      </div>
    </header>
  );
}
