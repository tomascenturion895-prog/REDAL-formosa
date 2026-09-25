"use client";

import Link from "next/link";

import { adminRepository } from "@/lib/admin/admin-repository";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { EmptyState } from "@/components/ui/empty-state";

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
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/productos" className="btn btn-primary">
          Revisar productos pendientes
        </Link>
        <Link href="/admin/usuarios" className="btn btn-secondary">
          Administrar usuarios
        </Link>
      </div>
    </div>
  );
}
