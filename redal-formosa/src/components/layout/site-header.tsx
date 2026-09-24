import Link from "next/link";

import { siteName } from "@/lib/navigation";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

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
        <UserMenu />
      </div>
    </header>
  );
}
