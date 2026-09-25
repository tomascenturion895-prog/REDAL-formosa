"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { catalogRepository, type ProductSearchResult } from "@/lib/catalog/catalog-repository";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/layout/page-header";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon } from "@/components/ui/icons";

type SortKey = "relevancia" | "recientes" | "precio_asc" | "precio_desc";

const SORT_LABEL: Record<SortKey, string> = {
  relevancia: "Más relevantes",
  recientes: "Más nuevos",
  precio_asc: "Menor precio",
  precio_desc: "Mayor precio",
};

// Cada criterio de orden es una función: agregar uno nuevo no toca a los demás.
const COMPARATORS: Record<SortKey, (a: ProductSearchResult, b: ProductSearchResult) => number> = {
  relevancia: (a, b) => b.relevance - a.relevance,
  recientes: (a, b) => b.created_at.localeCompare(a.created_at),
  precio_asc: (a, b) => a.precio - b.precio,
  precio_desc: (a, b) => b.precio - a.precio,
};

async function loadCatalog(query: string, priceMax: number | undefined, disponibleOnly: boolean) {
  const products = await catalogRepository.searchProducts({ query, priceMax, disponibleOnly });
  const names = await catalogRepository.getEmprendimientoNames(products.map((p) => p.emprendimiento_id));
  return { products, names };
}

/** Campo de búsqueda con estado propio. El padre lo remonta (key) cuando cambia la URL. */
function CatalogSearchForm({ initialQuery, onSearch }: { initialQuery: string; onSearch: (term: string) => void }) {
  const [input, setInput] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(input.trim());
      }}
      role="search"
      className="flex flex-wrap items-center gap-3"
    >
      <div className="relative min-w-64 flex-1">
        <label htmlFor="catalog-search" className="sr-only">
          Buscar productos
        </label>
        <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="catalog-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Buscá miel, mandioca, artesanías…"
          className="field !pl-10"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Buscar
      </button>
    </form>
  );
}

function CatalogContent() {
  const router = useRouter();
  const q = useSearchParams().get("q") ?? "";

  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [priceMax, setPriceMax] = useState("");
  const [sortChoice, setSortChoice] = useState<SortKey | null>(null);
  // Sin elección explícita: relevancia si hay búsqueda, novedades si no.
  const sort: SortKey = sortChoice ?? (q ? "relevancia" : "recientes");

  const max = priceMax ? Number(priceMax) : undefined;
  const { data, error, loading, reload } = useAsync(() => loadCatalog(q, max, onlyAvailable), [q, max, onlyAvailable]);

  const sorted = useMemo(() => (data ? [...data.products].sort(COMPARATORS[sort]) : null), [data, sort]);

  const search = (term: string) => {
    setSortChoice(null);
    router.replace(term ? `/productos?q=${encodeURIComponent(term)}` : "/productos");
  };

  return (
    <div className="page-container py-section">
      <PageHeader
        title={q ? `Resultados para “${q}”` : "Productos"}
        description={q ? undefined : "Todo lo que producen los emprendedores de Formosa."}
      />

      <CatalogSearchForm key={q} initialQuery={q} onSearch={search} />

      <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <button type="button" className="chip" aria-pressed={onlyAvailable} onClick={() => setOnlyAvailable((v) => !v)}>
          Solo disponibles
        </button>

        <label className="flex items-center gap-2 text-sm text-muted">
          Hasta
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="$ sin límite"
            className="field !w-32 !py-1.5 text-sm"
          />
        </label>

        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Ordenar
          <select value={sort} onChange={(e) => setSortChoice(e.target.value as SortKey)} className="field !w-auto !py-1.5 text-sm">
            {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 min-h-5 text-sm text-muted" aria-live="polite">
        {error ? "" : sorted && !loading ? `${sorted.length} ${sorted.length === 1 ? "producto" : "productos"}` : "Buscando…"}
      </p>

      <div className="mt-4">
        {error ? (
          <EmptyState
            illustration="error"
            title="Uy, no pudimos traer los productos"
            description="Puede ser tu conexión o un problema nuestro. Probá de nuevo en un momento."
            action={
              <button className="btn btn-primary" onClick={reload}>
                Reintentar
              </button>
            }
          />
        ) : !sorted || loading ? (
          <ProductGridSkeleton />
        ) : sorted.length === 0 ? (
          <EmptyState
            illustration={q ? "search" : "basket"}
            title={q ? "Ese producto no apareció por acá" : "La feria todavía está armándose"}
            description={
              q
                ? "Probá con otra palabra, o quitá los filtros de precio y disponibilidad."
                : "Cuando los emprendedores publiquen sus productos, los vas a ver acá."
            }
            action={
              <Link href="/emprendimientos" className="btn btn-secondary">
                Ver emprendimientos
              </Link>
            }
          />
        ) : (
          <ProductGrid products={sorted} emprendimientoNombres={data?.names} />
        )}
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="page-container py-section" />}>
      <CatalogContent />
    </Suspense>
  );
}
