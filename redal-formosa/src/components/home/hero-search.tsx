"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SearchIcon } from "@/components/ui/icons";

type Scope = "productos" | "emprendimientos";

const SCOPES: { value: Scope; label: string; placeholder: string }[] = [
  { value: "productos", label: "Productos", placeholder: "¿Qué querés comprar hoy? Miel, mandioca, verduras…" },
  { value: "emprendimientos", label: "Emprendimientos", placeholder: "Buscá un emprendimiento por nombre o rubro" },
];

const QUICK_SEARCHES = ["Miel", "Mandioca", "Chipá", "Dulces", "Artesanías"];

export function HeroSearch() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("productos");
  const [query, setQuery] = useState("");
  const current = SCOPES.find((s) => s.value === scope)!;

  const go = (term: string, target: Scope = scope) => {
    const q = term.trim();
    router.push(q ? `/${target}?q=${encodeURIComponent(q)}` : `/${target}`);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div role="radiogroup" aria-label="Qué querés buscar" className="inline-flex rounded-full border border-border bg-surface p-1">
        {SCOPES.map((s) => (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={scope === s.value}
            onClick={() => setScope(s.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              scope === s.value ? "bg-action text-on-action" : "text-muted hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(query);
        }}
        className="flex gap-2 rounded-full border border-border bg-surface p-1.5 shadow-card focus-within:border-action"
      >
        <label htmlFor="hero-search" className="sr-only">
          {current.placeholder}
        </label>
        <div className="relative flex-1">
          <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="hero-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={current.placeholder}
            className="w-full rounded-full bg-transparent py-2.5 pl-11 pr-3 outline-none placeholder:text-muted"
          />
        </div>
        <button type="submit" className="btn btn-primary !rounded-full !px-6">
          Buscar
        </button>
      </form>

      <ul className="flex flex-wrap gap-2">
        {QUICK_SEARCHES.map((term) => (
          <li key={term}>
            <button type="button" className="chip" onClick={() => go(term, "productos")}>
              {term}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
