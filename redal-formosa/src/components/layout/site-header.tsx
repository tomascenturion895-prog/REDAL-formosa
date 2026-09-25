import { Suspense } from "react";
import Link from "next/link";

import { SearchBox } from "@/components/search/search-box";
import { NavLinks } from "./nav-links";
import { HeaderActions } from "./header-actions";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="page-container flex h-16 items-center gap-4 lg:gap-6">
        <Link
          href="/"
          className="font-display text-xl font-bold leading-none tracking-tight text-action"
        >
          RedAL
          <span className="ml-1.5 font-medium text-foreground">Formosa</span>
        </Link>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden w-56 lg:block xl:w-72">
            <Suspense fallback={null}>
              <SearchBox />
            </Suspense>
          </div>
          <HeaderActions />
        </div>
      </div>

      <div className="border-t border-border md:hidden">
        <div className="page-container">
          <NavLinks />
        </div>
      </div>
    </header>
  );
}
