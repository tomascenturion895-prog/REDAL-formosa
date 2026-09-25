"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPinIcon, SearchIcon, StoreIcon } from "@/components/ui/icons";

function EmprendimientosContent() {
  const { data: items, error } = useAsync(() => catalogRepository.listEmprendimientos(), []);
  // La búsqueda de la portada llega como ?q=; después la persona sigue editándola acá.
  const [term, setTerm] = useState(useSearchParams().get("q") ?? "");

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return (items ?? []).filter((e) => !t || e.nombre.toLowerCase().includes(t) || (e.descripcion ?? "").toLowerCase().includes(t));
  }, [items, term]);

  return (
    <div className="page-container py-section">
      <PageHeader title="Emprendimientos" description="Conocé a quienes producen en Formosa y comprales directo." />

      <div className="relative mb-8 max-w-md">
        <label htmlFor="emp-search" className="sr-only">
          Buscar emprendimientos
        </label>
        <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="emp-search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por nombre o rubro"
          className="field !pl-10"
        />
      </div>

      {error ? (
        <EmptyState title="No pudimos cargar los emprendimientos" description="Revisá tu conexión e intentá de nuevo." />
      ) : !items ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="card h-40 animate-pulse bg-surface-muted" />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<StoreIcon size={36} />}
          title={term ? "No encontramos emprendimientos con ese nombre" : "Todavía no hay emprendimientos"}
          description={term ? "Probá con otra palabra." : "Los emprendedores que se sumen van a aparecer acá."}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emp) => (
            <li key={emp.id}>
              <Link
                href={`/emprendimientos/${emp.id}`}
                className="card group flex h-full flex-col gap-4 p-5 transition-colors hover:border-border-strong"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-100 font-display text-xl font-bold text-primary-800">
                    {emp.nombre.charAt(0).toUpperCase()}
                  </span>
                  <h2 className="font-display text-lg font-semibold leading-tight group-hover:text-action">{emp.nombre}</h2>
                </div>
                <p className="line-clamp-3 text-sm text-muted">{emp.descripcion || "Todavía no cargó una descripción."}</p>
                {emp.direccion && (
                  <p className="mt-auto flex items-center gap-1.5 text-sm text-muted">
                    <MapPinIcon size={16} />
                    <span className="truncate">{emp.direccion}</span>
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function EmprendimientosPage() {
  return (
    <Suspense fallback={<div className="page-container py-section" />}>
      <EmprendimientosContent />
    </Suspense>
  );
}
