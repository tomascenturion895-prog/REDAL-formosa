import React from "react";
import { DeliverySchedule } from "@/types";

interface DeliveryInfoSectionProps {
  schedules: DeliverySchedule[];
  localidad: string;
}

export function DeliveryInfoSection({
  schedules,
  localidad,
}: DeliveryInfoSectionProps) {
  const getIconForType = (tipo: DeliverySchedule["tipo"]) => {
    switch (tipo) {
      case "feria":
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-sm">
            🎪
          </span>
        );
      case "domicilio":
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-sm">
            🚚
          </span>
        );
      case "retiro_en_finca":
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-sm">
            🏡
          </span>
        );
      default:
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-sm">
            📍
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>📍</span> Puntos y Días de Entrega en Formosa
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Coordiná tu retiro en puestos de feria habilitados o pactá entrega en nodo barrial.
          </p>
        </div>
        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Origen: {localidad}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className="flex flex-col justify-between rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-4 transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
          >
            <div className="flex items-start gap-3">
              {getIconForType(schedule.tipo)}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {schedule.dia}
                </span>
                <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                  {schedule.lugar}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-700/60 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {schedule.horario}
              </span>
              <span className="capitalize text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                {schedule.tipo === "feria" ? "Puesto de Feria" : "Reparto"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
