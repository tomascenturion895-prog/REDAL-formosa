import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// TODO: Fetch from Supabase
const B2B_DEALS: any[] = [];

export function B2BCatalogSection() {
  return (
    <section id="ofertas-destacadas" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Lotes y Bultos Cerrados
          </span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            Ofertas Mayoristas de Origen
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Precios por cajón, bolsa o bulto para entrega semanal directa a tu establecimiento.
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Valores actualizados a precios de chacra
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {B2B_DEALS.map((deal) => (
          <div
            key={deal.id}
            className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
          >
            <div>
              {/* Product Image & Deal Tag */}
              <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={deal.fotoUrl}
                  alt={deal.productoNombre}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="accent" size="sm">
                    Ahorro ~{deal.ahorroEstimadoPorcentaje}%
                  </Badge>
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  {deal.productorLocalidad}
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  {deal.productorNombre}
                </span>

                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                  {deal.productoNombre}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {deal.descripcionCorta}
                </p>

                {/* Specs Box */}
                <div className="mt-4 space-y-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Mínimo de compra:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {deal.volumenMinimo}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Capacidad semanal:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      ~{deal.capacidadSemanalKg} kg
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Frecuencia:</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                      {deal.frecuenciaCosecha}
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500">Precio mayorista:</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">
                      ${deal.precioMayorista.toLocaleString("es-AR")}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">
                      {" "}
                      / {deal.unidadMedida}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 flex gap-2">
              <Link
                href={`/productor/${deal.productorId}`}
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-center text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Ver Productor
              </Link>
              <Button
                variant="primary"
                size="sm"
                href="#solicitar-cotizacion"
                className="flex-1 text-xs"
              >
                Cotizar Lote
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
