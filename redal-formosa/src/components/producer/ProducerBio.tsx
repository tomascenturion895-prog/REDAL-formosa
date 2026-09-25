import React from "react";
import { Producer } from "@/types";

interface ProducerBioProps {
  producer: Producer;
}

export function ProducerBio({ producer }: ProducerBioProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Story & Practices (2 cols) */}
      <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-7 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-sm">
            🌾
          </span>
          Nuestra Historia y Forma de Cultivo
        </h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {producer.historiaBio}
        </p>

        {/* Agricultural Highlights */}
        <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Compromiso Productivo Local
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {producer.metodosCultivo.map((metodo, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs text-zinc-700 dark:text-zinc-300"
              >
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{metodo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commercial & Fast Logistics Box (1 col) */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/40 dark:to-zinc-900 border border-emerald-200/70 dark:border-emerald-800/40 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            Circuito Corto REDAL
          </span>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">
            Frescura de Cosecha Directa
          </h3>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Comprando a través de este catálogo apoyás el precio justo para la familia productora
            y recibís alimentos cosechados menos de 24 horas antes de la entrega.
          </p>

          <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <strong>Cosecha semanal:</strong> Martes y Viernes
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <strong>Cobro:</strong> Efectivo, Transferencia, Chigüé / QR
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <strong>Atención:</strong> Directa con la chacra
            </li>
          </ul>
        </div>

        {producer.aceptaB2B && (
          <div className="mt-5 rounded-xl bg-white/80 dark:bg-zinc-900/80 p-3.5 border border-emerald-200 dark:border-emerald-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Atención Comercios & B2B
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Mayorista
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
              Descuentos especiales por cajón y bolsas completas para verdulerías y restaurantes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
