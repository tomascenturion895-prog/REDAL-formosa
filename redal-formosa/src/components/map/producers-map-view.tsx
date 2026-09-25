"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { directionsUrl, filterPoints, toMapPoints } from "@/lib/domain/map";
import { useAsync } from "@/lib/hooks/use-async";
import { ContactActions, ContactBar } from "@/components/contact/contact-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { CloseIcon, MapPinIcon, SearchIcon } from "@/components/ui/icons";
import { EmprendimientosMap } from "./lazy-map";

export function ProducersMapView({ initialSelectedId = null }: { initialSelectedId?: string | null }) {
  const { data, error, loading, reload } = useAsync(() => catalogRepository.listEmprendimientos(), []);
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const all = useMemo(() => (data ? toMapPoints(data) : []), [data]);
  const visible = useMemo(() => filterPoints(all, term), [all, term]);
  const selected = visible.find((p) => p.id === selectedId) ?? null;

  // Al elegir un pin, la lista se desplaza hasta ese emprendimiento.
  useEffect(() => {
    if (selectedId) itemRefs.current[selectedId]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  if (error) {
    return (
      <EmptyState
        illustration="error"
        title="Uy, el mapa no cargó"
        description="Revisá tu conexión e intentá de nuevo."
        action={
          <button className="btn btn-primary" onClick={reload}>
            Reintentar
          </button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 lg:h-[calc(100dvh-14rem)] lg:min-h-[34rem] lg:grid-cols-[22rem_1fr]">
      <aside className="order-2 flex min-h-0 flex-col gap-3 lg:order-1">
        <div className="relative">
          <label htmlFor="map-search" className="sr-only">
            Buscar emprendimientos en el mapa
          </label>
          <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="map-search"
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por nombre o zona"
            className="field !pl-10"
          />
        </div>

        <p className="text-sm text-muted" aria-live="polite">
          {loading ? "Cargando…" : `${visible.length} ${visible.length === 1 ? "emprendimiento" : "emprendimientos"} en el mapa`}
        </p>

        <ul className="-mr-1 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => <li key={i} className="card h-20 animate-pulse bg-surface-muted" aria-hidden="true" />)}

          {!loading && visible.length === 0 && (
            <li className="card border-dashed px-4 py-8 text-center text-sm text-muted">
              {term ? "Ningún emprendimiento coincide con tu búsqueda." : "Todavía no hay emprendimientos con ubicación cargada."}
            </li>
          )}

          {visible.map((point) => {
            const active = point.id === selectedId;
            return (
              <li
                key={point.id}
                ref={(node) => {
                  itemRefs.current[point.id] = node;
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(active ? null : point.id)}
                  aria-pressed={active}
                  className={`card w-full p-4 text-left transition-colors ${active ? "border-action bg-success-soft" : "hover:border-border-strong"}`}
                >
                  <span className="block font-display font-semibold leading-tight">{point.nombre}</span>
                  {point.direccion && (
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <MapPinIcon size={14} className="shrink-0" />
                      <span className="truncate">{point.direccion}</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="relative isolate order-1 h-[24rem] overflow-hidden rounded-card border border-border lg:order-2 lg:h-auto">
        <EmprendimientosMap points={visible} selectedId={selectedId} onSelect={setSelectedId} />

        {!loading && all.length === 0 && (
          <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-background/70 p-6 backdrop-blur-[2px]">
            <EmptyState
              illustration="map"
              title="El mapa se está llenando"
              description="Cuando los emprendedores carguen su ubicación, los vas a ver acá."
              action={
                <Link href="/setup" className="btn btn-primary">
                  Sumar mi emprendimiento
                </Link>
              }
            />
          </div>
        )}

        {selected && (
          <div className="absolute inset-x-3 bottom-3 z-[1100] rounded-card border border-border bg-surface p-4 shadow-pop sm:right-auto sm:max-w-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold leading-tight">{selected.nombre}</h2>
                {selected.direccion && <p className="mt-1 text-sm text-muted">{selected.direccion}</p>}
              </div>
              <button type="button" onClick={() => setSelectedId(null)} aria-label="Cerrar detalle" className="btn btn-ghost !p-1.5">
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Link href={`/emprendimientos/${selected.id}`} className="btn btn-primary btn-sm">
                  Ver productos
                </Link>
                <a href={directionsUrl(selected.position)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  Cómo llegar
                </a>
              </div>
              <ContactBar>
                <ContactActions
                  telefono={selected.telefono}
                  mensaje={`Hola, vi tu emprendimiento ${selected.nombre} en RedAL Formosa y quería consultarte.`}
                  size="sm"
                />
              </ContactBar>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
