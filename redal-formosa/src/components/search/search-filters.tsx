"use client";

import { useState } from "react";

export interface FilterState {
  priceMin: number;
  priceMax: number;
  disponibleOnly: boolean;
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  maxPrice?: number;
}

export function SearchFilters({ onFilterChange, maxPrice = 50000 }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceMin: 0,
    priceMax: maxPrice,
    disponibleOnly: false,
  });

  const handlePriceMinChange = (value: number) => {
    const newFilters = { ...filters, priceMin: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceMaxChange = (value: number) => {
    const newFilters = { ...filters, priceMax: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAvailableToggle = () => {
    const newFilters = { ...filters, disponibleOnly: !filters.disponibleOnly };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-6 p-4 rounded-card border border-border bg-surface-muted">
      <div>
        <h3 className="font-semibold text-foreground mb-4">Filtros</h3>
      </div>

      {/* Rango de precio */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Rango de precio
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={filters.priceMin}
              onChange={(e) => handlePriceMinChange(Number(e.target.value))}
              placeholder="Mín"
              className="flex-1 rounded-control border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              type="number"
              max={maxPrice}
              value={filters.priceMax}
              onChange={(e) => handlePriceMaxChange(Number(e.target.value))}
              placeholder="Máx"
              className="flex-1 rounded-control border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>

          {/* Sliders visualization */}
          <div className="text-xs text-muted">
            ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.disponibleOnly}
            onChange={handleAvailableToggle}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">
            Solo disponibles
          </span>
        </label>
      </div>

      {/* Reset button */}
      <button
        onClick={() => {
          const resetFilters = {
            priceMin: 0,
            priceMax: maxPrice,
            disponibleOnly: false,
          };
          setFilters(resetFilters);
          onFilterChange(resetFilters);
        }}
        className="w-full text-sm text-link hover:underline py-2"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
