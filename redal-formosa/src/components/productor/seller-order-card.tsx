"use client";

import { WhatsAppButton } from "@/components/contact/whatsapp-button";
import { MapPinIcon } from "@/components/ui/icons";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/domain/order-status";
import { buyerMessage, extractBuyerPhone, NEXT_STEP, timeAgo, type SellerOrder } from "@/lib/domain/seller-orders";
import { formatPrice } from "@/lib/format";

interface SellerOrderCardProps {
  order: SellerOrder;
  busy: boolean;
  onAdvance: (order: SellerOrder) => void;
  /** Mostrar el nombre del emprendimiento (cuando la persona tiene más de uno). */
  showStore?: boolean;
}

export function SellerOrderCard({ order, busy, onAdvance, showStore }: SellerOrderCardProps) {
  const step = NEXT_STEP[order.estado];
  const phone = extractBuyerPhone(order.nota_cliente);
  const note = order.nota_cliente?.replace(/Tel:\s*[+\d][\d\s().-]{5,}\s*(·\s*)?/i, "").trim();

  return (
    <article className="card space-y-4 p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{order.comprador_nombre}</h3>
          <p className="text-sm text-muted">
            {order.numero_pedido} · {timeAgo(order.creado_en)}
            {showStore && <> · {order.emprendimiento_nombre}</>}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_TONE[order.estado]}`}>{ORDER_STATUS_LABEL[order.estado]}</span>
      </header>

      <ul className="divide-y divide-border rounded-control border border-border text-sm">
        {order.items.map((item) => (
          <li key={item.nombre} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="min-w-0">
              <span className="font-semibold tabular-nums">{item.cantidad} ×</span> {item.nombre}
            </span>
            <span className="shrink-0 tabular-nums text-muted">{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      {(order.direccion_entrega || note) && (
        <div className="space-y-1 text-sm">
          {order.direccion_entrega && (
            <p className="flex items-start gap-1.5">
              <MapPinIcon size={16} className="mt-0.5 shrink-0 text-muted" />
              {order.direccion_entrega}
            </p>
          )}
          {note && <p className="text-muted">Nota: {note}</p>}
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted">
          Total <span className="font-display text-xl font-bold tabular-nums text-foreground">{formatPrice(order.monto_total)}</span>
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
          {phone && (
            <WhatsAppButton
              telefono={phone}
              mensaje={buyerMessage(order)}
              label="Avisar al comprador"
              size="sm"
              className="!bg-surface !text-foreground border border-border-strong hover:!bg-surface-muted"
            />
          )}
          {step && (
            <button
              type="button"
              onClick={() => onAdvance(order)}
              disabled={busy}
              aria-busy={busy}
              className="btn btn-primary btn-sm"
            >
              {step.label}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
