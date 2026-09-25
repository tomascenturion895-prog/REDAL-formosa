import Link from "next/link";

import { groupOrders, type SellerOrder } from "@/lib/domain/seller-orders";
import { CheckIcon } from "@/components/ui/icons";

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
  cta: string;
}

interface TodayPanelProps {
  orders: SellerOrder[] | undefined;
  published: number;
  inReview: number;
  checklist: ChecklistItem[];
}

function Tile({ label, value, hint, href, highlight }: { label: string; value: number; hint: string; href?: string; highlight?: boolean }) {
  const body = (
    <div
      className={`h-full rounded-card border p-4 transition-colors ${
        highlight ? "border-action bg-success-soft" : "border-border bg-surface"
      } ${href ? "hover:border-border-strong" : ""}`}
    >
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-1 font-display text-4xl font-bold tabular-nums ${highlight ? "text-action" : ""}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/** "Hoy": lo que el vendedor necesita ver primero al abrir la app. */
export function TodayPanel({ orders, published, inReview, checklist }: TodayPanelProps) {
  const groups = orders ? groupOrders(orders) : null;
  const toPrepare = groups?.por_preparar.length ?? 0;
  const preparing = groups?.en_preparacion.length ?? 0;
  const pending = checklist.filter((item) => !item.done);
  const done = checklist.length - pending.length;

  return (
    <section aria-label="Resumen de hoy" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="Por preparar"
          value={toPrepare}
          hint={toPrepare ? "Pedidos pagados esperando" : "Sin pedidos nuevos"}
          href="/dashboard/pedidos"
          highlight={toPrepare > 0}
        />
        <Tile label="En preparación" value={preparing} hint="Los que estás armando" href="/dashboard/pedidos" />
        <Tile label="Publicados" value={published} hint="Visibles para compradores" />
        <Tile label="En revisión" value={inReview} hint="Esperan aprobación" />
      </div>

      {pending.length > 0 && (
        <div className="rounded-card border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Terminá de configurar tu emprendimiento</h2>
            <span className="text-sm font-medium text-muted">
              {done} de {checklist.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div className="h-full rounded-full bg-action" style={{ width: `${(done / checklist.length) * 100}%` }} />
          </div>
          <ul className="mt-3 divide-y divide-border text-sm">
            {checklist.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-3 py-2.5">
                <span className={`flex items-center gap-2 ${item.done ? "text-muted line-through" : "font-medium"}`}>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${item.done ? "bg-action text-on-action" : "border border-border-strong"}`}
                    aria-hidden="true"
                  >
                    {item.done && <CheckIcon size={12} />}
                  </span>
                  {item.label}
                </span>
                {!item.done && (
                  item.href.startsWith("#") ? (
                    <a href={item.href} className="btn btn-secondary btn-sm shrink-0">
                      {item.cta}
                    </a>
                  ) : (
                    <Link href={item.href} className="btn btn-secondary btn-sm shrink-0">
                      {item.cta}
                    </Link>
                  )
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
