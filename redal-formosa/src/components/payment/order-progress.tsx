import { ORDER_STATUS_LABEL } from "@/lib/domain/order-status";
import type { OrderStatus } from "@/lib/supabase/types";
import { CheckIcon } from "@/components/ui/icons";

const FLOW: OrderStatus[] = ["pagado", "en_preparacion", "listo", "en_camino", "entregado"];

/** Etapas del pedido una vez pagado, con la actual resaltada. */
export function OrderProgress({ estado }: { estado: OrderStatus }) {
  const current = FLOW.indexOf(estado);
  if (current === -1) return null;

  return (
    <ol aria-label="Etapas del pedido" className="grid grid-cols-5 gap-1 text-center text-xs">
      {FLOW.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} aria-current={active ? "step" : undefined} className="flex flex-col items-center gap-1.5">
            <span className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${index === 0 ? "opacity-0" : done || active ? "bg-action" : "bg-border"}`} />
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done || active ? "bg-action text-on-action" : "bg-surface-muted text-muted"
                } ${active ? "ring-4 ring-success-soft" : ""}`}
              >
                {done ? <CheckIcon size={14} /> : index + 1}
              </span>
              <span className={`h-0.5 flex-1 ${index === FLOW.length - 1 ? "opacity-0" : done ? "bg-action" : "bg-border"}`} />
            </span>
            <span className={active ? "font-semibold text-foreground" : "text-muted"}>{ORDER_STATUS_LABEL[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
