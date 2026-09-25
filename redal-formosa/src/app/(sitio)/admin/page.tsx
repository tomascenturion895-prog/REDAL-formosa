"use client";

import Link from "next/link";

import { adminRepository } from "@/lib/admin/admin-repository";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { EmptyState } from "@/components/ui/empty-state";
import { VoicePostCreator } from "@/components/producer/VoicePostCreator";

export default function AdminDashboard() {
  const { data: stats, error } = useAsync(() => adminRepository.stats(), []);

  if (error) {
    return (
      <EmptyState
        title="No pudimos cargar las métricas"
        description="Verificá que las migraciones de administración estén aplicadas en la base."
      />
    );
  }
  if (!stats) return <div aria-busy="true" className="h-40" />;

  const cards: [string, string][] = [
    ["Usuarios", String(stats.total_usuarios)],
    ["Productos", String(stats.total_productos)],
    ["Pedidos", String(stats.total_pedidos)],
    ["Calificaciones", String(stats.total_calificaciones)],
    ["Ingresos por pedidos pagados", formatPrice(stats.ingresos_totales)],
    ["Pedidos entregados", String(stats.pedidos_completados)],
    ["Pedidos en camino", String(stats.pedidos_en_entrega)],
  ];

  return (
    <div className="flex flex-col gap-6">
      <VoicePostCreator />
      
      {/* Botones de acción */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link 
          href="/admin/productos" 
          className="btn btn-primary w-full px-6 py-2 shadow-sm sm:w-auto"
        >
          Revisar productos pendientes
        </Link>
        <Link 
          href="/admin/usuarios" 
          className="btn btn-secondary w-full bg-surface px-6 py-2 shadow-sm sm:w-auto"
        >
          Administrar usuarios
        </Link>
      </div>

      {/* Grilla de métricas compacta */}
      <section aria-label="Métricas principales">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map(([label, value]) => {
            const isIngresos = label.includes("Ingresos");
            return (
              <div 
                key={label} 
                className={`group flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                  isIngresos 
                    ? "border-action bg-action/5 hover:border-action/80" 
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                <dt className={`text-sm font-medium ${isIngresos ? "text-action" : "text-muted"}`}>
                  {label}
                </dt>
                <dd className={`mt-2 font-display text-3xl font-bold tracking-tight tabular-nums ${isIngresos ? "text-action" : "text-foreground"}`}>
                  {value}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
    </div>
  );
}
