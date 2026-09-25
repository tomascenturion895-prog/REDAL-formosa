"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { catalogRepository } from "@/lib/catalog/catalog-repository";
import { toMapPoints } from "@/lib/domain/map";
import { useAsync } from "@/lib/hooks/use-async";
import { EmprendimientosMap } from "@/components/map/lazy-map";

/** Vista previa del mapa para la portada: al tocar un pin se abre el mapa completo en ese punto. */
export function HomeMapPreview() {
  const router = useRouter();
  const { data, loading } = useAsync(() => catalogRepository.listEmprendimientos(), []);
  const points = useMemo(() => (data ? toMapPoints(data) : []), [data]);

  return (
    <div className="relative isolate h-full w-full">
      <EmprendimientosMap points={points} scrollZoom={false} onSelect={(id) => router.push(`/mapa?punto=${id}`)} />

      <div className="absolute inset-x-3 bottom-3 z-[1100] flex flex-wrap items-center justify-between gap-2 rounded-control border border-border bg-surface/95 p-2 pl-4 shadow-pop backdrop-blur">
        <p className="text-sm text-muted" aria-live="polite">
          {loading
            ? "Cargando el mapa…"
            : points.length > 0
              ? `${points.length} ${points.length === 1 ? "emprendimiento cerca tuyo" : "emprendimientos cerca tuyo"}`
              : "Todavía no hay emprendimientos en el mapa"}
        </p>
        <Link href="/mapa" className="btn btn-primary btn-sm">
          Ver mapa completo
        </Link>
      </div>
    </div>
  );
}
