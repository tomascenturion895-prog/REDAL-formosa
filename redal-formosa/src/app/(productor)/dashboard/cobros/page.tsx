"use client";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { payoutsRepository } from "@/lib/payouts/payouts-repository";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function MisCobrosPage() {
  const { user, pending: authPending } = useRequireAuth();
  const opts = { enabled: Boolean(user), scope: user?.id };
  const { data: pending, error } = useAsync(() => payoutsRepository.pending(), [user?.id], opts);
  const { data: history } = useAsync(() => payoutsRepository.history(), [user?.id], opts);

  if (authPending || (!pending && !error)) return <Skeleton className="h-56" />;
  if (error || !pending) return <Alert tone="error">No pudimos cargar tus cobros. Probá de nuevo en un momento.</Alert>;

  return (
    <div className="space-y-10">
      <section aria-labelledby="por-cobrar" className="space-y-4">
        <h2 id="por-cobrar" className="text-heading">
          Por cobrar
        </h2>
        <p className="text-sm text-muted">
          Se suman los pedidos entregados y cobrados. Te transferimos a la cuenta bancaria que cargaste y lo ves abajo con el número de operación.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {pending.map((p) => (
            <article key={p.emprendimiento_id} className="card space-y-3 p-5">
              <h3 className="font-display text-lg font-semibold">{p.emprendimiento_nombre}</h3>
              <p className="font-display text-3xl font-bold tabular-nums">{formatPrice(p.monto_neto)}</p>
              <p className="text-sm text-muted">
                {p.cantidad_pedidos === 0
                  ? "No tenés pedidos entregados pendientes de cobro."
                  : `${p.cantidad_pedidos} ${p.cantidad_pedidos === 1 ? "pedido" : "pedidos"} · ventas ${formatPrice(p.monto_bruto)}${
                      p.comision > 0 ? ` − comisión ${p.comision_pct}% (${formatPrice(p.comision)})` : ""
                    }`}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="historial" className="space-y-4">
        <h2 id="historial" className="text-heading">
          Transferencias recibidas
        </h2>
        {!history || history.length === 0 ? (
          <p className="rounded-card border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            Todavía no te transferimos ningún cobro.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-card border border-border bg-surface">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  <span className="font-medium">{formatDate(h.pagado_en)}</span>
                  <span className="text-muted"> · {h.cantidad_pedidos} {h.cantidad_pedidos === 1 ? "pedido" : "pedidos"} · op. {h.referencia}</span>
                </span>
                <span className="font-display text-lg font-bold tabular-nums">{formatPrice(h.monto_neto)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
