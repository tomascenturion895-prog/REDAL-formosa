import Link from "next/link";

import { siteName } from "@/lib/navigation";
import { NavLinks } from "./nav-links";
import { HeaderActions } from "./header-actions";
import { SearchBox } from "@/components/search/search-box";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="page-container space-y-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-action">
            {siteName}
          </Link>
          <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
            <NavLinks />
          </div>
          <HeaderActions />
        </div>
        <div className="sm:w-96">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
