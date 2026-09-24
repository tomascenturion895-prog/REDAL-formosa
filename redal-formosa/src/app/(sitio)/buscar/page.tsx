"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { searchService, type SearchResult } from "@/lib/search/search-service";
import { SearchBox } from "@/components/search/search-box";
import { SearchFilters, type FilterState } from "@/components/search/search-filters";
import { StarRating } from "@/components/ratings/star-rating";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    priceMin: 0,
    priceMax: 50000,
    disponibleOnly: false,
  });

  useEffect(() => {
    performSearch();
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const data = await searchService.search({
        query,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        disponibleOnly: filters.disponibleOnly,
      });
      setResults(data);
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">🔍 Buscar Productos</h1>
        <SearchBox />
      </div>

      {query && (
        <div className="text-sm text-muted">
          {loading ? "Buscando..." : `${results.length} resultados para "${query}"`}
        </div>
      )}

      {!query && !loading && (
        <div className="rounded-card border border-border bg-surface-muted p-12 text-center">
          <p className="text-lg text-muted">Ingresa un término para buscar</p>
        </div>
      )}

      {query && (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar con filtros */}
          <div className="lg:col-span-1">
            <SearchFilters onFilterChange={handleFilterChange} maxPrice={50000} />
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">Cargando resultados...</div>
            ) : results.length === 0 ? (
              <div className="rounded-card border border-border bg-surface-muted p-8 text-center">
                <p className="text-muted mb-4">
                  No encontramos productos que coincidan con tu búsqueda
                </p>
                <Link
                  href="/productos"
                  className="inline-block text-link hover:underline"
                >
                  Ver todos los productos
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 auto-rows-max">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.id}`}
                    className="group rounded-card border border-border bg-surface overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {product.imagen_principal && (
                      <img
                        src={product.imagen_principal}
                        alt={product.nombre}
                        className="w-full h-40 object-cover bg-surface-muted group-hover:opacity-90 transition-opacity"
                      />
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-action transition-colors line-clamp-2">
                        {product.nombre}
                      </h3>
                      <p className="text-sm text-muted line-clamp-1">
                        {product.descripcion}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <p className="font-bold text-action">
                          ${product.precio.toFixed(2)}
                        </p>
                        <span className="text-xs text-muted">
                          {product.disponible ? "✓ Disponible" : "No disponible"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <div className="page-container py-section">
      <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
