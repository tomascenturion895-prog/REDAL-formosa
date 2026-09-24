"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBox({ placeholder = "Buscar productos...", onSearch }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className={`
        relative rounded-control border transition-colors
        ${isFocused ? "border-action bg-surface" : "border-border bg-surface-muted"}
      `}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-transparent text-sm outline-none"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
        >
          🔍
        </button>
      </div>
    </form>
  );
}
