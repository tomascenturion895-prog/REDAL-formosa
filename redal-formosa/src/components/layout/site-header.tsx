import { Suspense } from "react";

import { Logo } from "@/components/brand/logo";
import { SearchBox } from "@/components/search/search-box";
import { NavLinks } from "./nav-links";
import { HeaderActions } from "./header-actions";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="page-container flex h-[4.5rem] items-center gap-2 sm:gap-4 lg:gap-6">
        <Logo descriptor />

        <div className="ml-2 hidden md:block">
          <NavLinks />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <div className="hidden w-64 xl:block">
            <Suspense fallback={null}>
              <SearchBox />
            </Suspense>
          </div>
          <HeaderActions />
          <MobileNav />
        </div>
      </div>

    </header>
  );
}
