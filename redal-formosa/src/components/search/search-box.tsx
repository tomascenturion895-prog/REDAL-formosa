"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchIcon } from "@/components/ui/icons";

export function SearchBox({ placeholder = "Buscar productos" }: { placeholder?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params?.get("q") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <label htmlFor="header-search" className="sr-only">
        {placeholder}
      </label>
      <SearchIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        id="header-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="field !rounded-full !bg-surface-muted !py-2 !pl-10 text-sm"
      />
    </form>
  );
}
