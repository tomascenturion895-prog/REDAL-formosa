"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNav } from "@/lib/navigation";
import { SearchBox } from "@/components/search/search-box";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

/** Menú hamburguesa para pantallas menores a `md`. Se cierra al navegar, con Escape o al tocar afuera. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost !h-10 !w-10 !rounded-full !p-0"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 top-[4.5rem] z-30 bg-ink-950/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav"
            aria-label="Principal"
            className="absolute inset-x-0 top-full z-40 border-b border-border bg-surface p-3 shadow-pop"
          >
            <div className="mb-2 px-1 xl:hidden">
              <Suspense fallback={null}>
                <SearchBox id="mobile-search" />
              </Suspense>
            </div>
            <ul className="page-container flex flex-col gap-1 !px-0">
              {mainNav.map(({ href, label }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-control px-4 py-3 text-base font-medium ${
                        active ? "bg-surface-muted text-foreground" : "text-muted hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
