"use client";

import Link from "next/link";

import { useAsync } from "@/lib/hooks/use-async";
import { novedadesRepository } from "@/lib/novedades/novedades-repository";

const dateFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Últimas novedades publicadas por los emprendimientos. Si no hay ninguna (o falla la carga), no ocupa lugar. */
export function ProducerFeed() {
  const { data: novedades, loading } = useAsync(() => novedadesRepository.latest(6), []);

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        <div className="card h-28 animate-pulse bg-surface-muted" />
        <div className="card hidden h-28 animate-pulse bg-surface-muted md:block" />
        <div className="card hidden h-28 animate-pulse bg-surface-muted lg:block" />
      </div>
    );
  }

  if (!novedades || novedades.length === 0) return null;

  return (
    <section aria-labelledby="novedades-title" className="space-y-5">
      <h2 id="novedades-title" className="text-heading">
        Novedades de los emprendimientos
      </h2>
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {novedades.map((novedad) => (
          <li key={novedad.id} className="card flex flex-col justify-between gap-4 p-5">
            <p className="text-sm leading-relaxed">«{novedad.contenido}»</p>
            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <Link href={`/emprendimientos/${novedad.emprendimientoId}`} className="truncate font-semibold text-action hover:underline">
                {novedad.emprendimientoNombre}
              </Link>
              <time dateTime={novedad.createdAt} className="shrink-0">
                {dateFormat.format(new Date(novedad.createdAt))}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
