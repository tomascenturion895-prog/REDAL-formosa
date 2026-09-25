"use client";

import Link from "next/link";

import { adminRepository } from "@/lib/admin/admin-repository";
import { activationRate, cancellationRate, trend, type Trend } from "@/lib/domain/admin-summary";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon } from "@/components/ui/icons";

function TrendBadge({ value }: { value: Trend }) {
  if (value.percent === null) {
    return <span className="text-xs text-muted">{value.direction === "up" ? "Primera semana con ventas" : "Sin datos previos"}</span>;
  }
  const tone = value.direction === "up" ? "text-success" : value.direction === "down" ? "text-danger" : "text-muted";
  const arrow = value.direction === "up" ? "↑" : value.direction === "down" ? "↓" : "→";
  return (
    <span className={`text-xs font-semibold ${tone}`}>
      {arrow} {Math.abs(value.percent)}% <span className="font-normal text-muted">vs. semana anterior</span>
    </span>
  );
}

function Kpi({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight">{value}</dd>
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, error } = useAsync(() => adminRepository.stats(), []);
  const { data: summary } = useAsync(() => adminRepository.summary(), []);

  if (error) {
    return (
      <EmptyState
        illustration="error"
        title="No pudimos cargar las métricas"
        description="Verificá que las migraciones de administración estén aplicadas en la base."
      />
    );
  }
  if (!stats || !summary) return <div aria-busy="true" className="h-40" />;

  const attention = [
    { label: "Productos por aprobar", value: summary.productos_pendientes, href: "/admin/productos", cta: "Revisar" },
    { label: "Identidades por verificar", value: summary.verificaciones_pendientes, href: "/admin/verificaciones", cta: "Verificar" },
    { label: "Pedidos sin preparar hace más de 24 h", value: summary.pedidos_sin_preparar, href: undefined, cta: "" },
  ];
  const allClear = attention.every((item) => item.value === 0);

  const orders = trend(summary.pedidos_7d, summary.pedidos_7d_previos);
  const sales = trend(summary.ingresos_7d, summary.ingresos_7d_previos);
  const cancelRate = cancellationRate(summary.cancelados_30d, summary.pedidos_30d);
  const activation = activationRate(summary.productores_con_pedidos_30d, summary.productores_activos);

  const totals: [string, string][] = [
    ["Usuarios", String(stats.total_usuarios)],
    ["Productos", String(stats.total_productos)],
    ["Pedidos", String(stats.total_pedidos)],
    ["Ingresos por pedidos pagados", formatPrice(stats.ingresos_totales)],
    ["Pedidos entregados", String(stats.pedidos_completados)],
    ["Pedidos en camino", String(stats.pedidos_en_entrega)],
  ];

  return (
    <div className="space-y-10">
      <section aria-labelledby="atencion" className="space-y-4">
        <h2 id="atencion" className="text-heading">
          Requiere tu atención
        </h2>

        {allClear ? (
          <div className="flex items-center gap-3 rounded-card border border-action bg-success-soft p-5 text-success">
            <CheckIcon size={22} />
            <p className="font-medium">Todo al día: no hay nada pendiente de revisión.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {attention.map(({ label, value, href, cta }) => {
              const active = value > 0;
              const body = (
                <div className={`h-full rounded-card border p-5 transition-colors ${active ? "border-highlight bg-warning-soft" : "border-border bg-surface"}`}>
                  <p className={`font-display text-4xl font-bold tabular-nums ${active ? "text-warning" : "text-muted"}`}>{value}</p>
                  <p className="mt-1 text-sm font-medium">{label}</p>
                  {active && href && <p className="mt-2 text-sm font-semibold text-link">{cta} →</p>}
                </div>
              );
              return <li key={label}>{href && active ? <Link href={href}>{body}</Link> : body}</li>;
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="semana" className="space-y-4">
        <h2 id="semana" className="text-heading">
          Esta semana
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Kpi label="Pedidos pagados (7 días)" value={String(summary.pedidos_7d)}>
            <TrendBadge value={orders} />
          </Kpi>
          <Kpi label="Ventas (7 días)" value={formatPrice(summary.ingresos_7d)}>
            <TrendBadge value={sales} />
          </Kpi>
        </dl>
      </section>

      <section aria-labelledby="calidad" className="space-y-4">
        <h2 id="calidad" className="text-heading">
          Calidad de la red
        </h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Kpi label="Calificación promedio" value={summary.calificacion_promedio === null ? "—" : `${summary.calificacion_promedio.toFixed(1)} / 5`}>
            <span className="text-xs text-muted">{summary.total_calificaciones} calificaciones</span>
          </Kpi>
          <Kpi label="Pedidos cancelados (30 días)" value={cancelRate === null ? "—" : `${cancelRate}%`}>
            <span className="text-xs text-muted">
              {summary.cancelados_30d} de {summary.pedidos_30d} pedidos
            </span>
          </Kpi>
          <Kpi label="Productores con ventas (30 días)" value={activation === null ? "—" : `${activation}%`}>
            <span className="text-xs text-muted">
              {summary.productores_con_pedidos_30d} de {summary.productores_activos} activos
            </span>
          </Kpi>
        </dl>
      </section>

      <section aria-labelledby="totales" className="space-y-4">
        <h2 id="totales" className="text-heading">
          Totales de la red
        </h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {totals.map(([label, value]) => (
            <div key={label} className="rounded-card border border-border bg-surface p-4">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin/usuarios" className="btn btn-secondary">
            Administrar usuarios
          </Link>
        </div>
      </section>
    </div>
  );
}
