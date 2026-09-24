"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNav } from "@/lib/navigation";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="-mx-1 flex gap-1 overflow-x-auto">
      {mainNav.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-control px-3 py-2 text-sm font-medium transition-colors duration-150 ease-soft ${
              active
                ? "bg-surface-muted text-foreground"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
