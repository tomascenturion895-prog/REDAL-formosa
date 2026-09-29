"use client";

import { useState } from "react";

import { WhatsAppButton } from "@/components/contact/whatsapp-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CashIcon, MapPinIcon } from "@/components/ui/icons";
import { isCash } from "@/lib/domain/payment-methods";
import { isCompletePin, PIN_LENGTH, PIN_MESSAGE, sanitizePin, type PinResult } from "@/lib/domain/delivery-pin";
import { ORDER_STATUS_TONE, statusLabel } from "@/lib/domain/order-status";
import { buyerMessage, canAssignCourier, canCancelAndRefund, extractBuyerPhone, NEXT_STEP, stripBuyerPhone, timeAgo, type CourierOption, type SellerOrder } from "@/lib/domain/seller-orders";
import { formatPrice } from "@/lib/format";

interface SellerOrderCardProps {
  order: SellerOrder;
  busy: boolean;
  /** Devuelve "error" si la acción falló por otra causa (la página ya mostró el aviso). */
  onAdvance: (order: SellerOrder, pin?: string) => Promise<PinResult | "error">;
  /** Mostrar el nombre del emprendimiento (cuando la persona tiene más de uno). */
  showStore?: boolean;
  /** Repartidores disponibles; si es null/vacío no se ofrece elegir (entrega el propio emprendimiento). */
  couriers?: CourierOption[] | null;
  onAssign?: (order: SellerOrder, courierId: string | null) => void;
  /** Cancela el pedido y devuelve el dinero; si no se pasa, no se ofrece. */
  onCancel?: (order: SellerOrder) => void | Promise<void>;
}

const VEHICLE_LABEL: Record<string, string> = { bicicleta: "bici", moto: "moto", auto: "auto", camion: "camión" };

export function SellerOrderCard({ order, busy, onAdvance, showStore, couriers, onAssign, onCancel }: SellerOrderCardProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const step = NEXT_STEP[order.estado];
  // Para cerrar la entrega hace falta el código de 4 dígitos que tiene el comprador.
  const needsPin = step?.estado === "entregado";
  const phone = extractBuyerPhone(order.nota_cliente);
  const note = stripBuyerPhone(order.nota_cliente);

  const advance = async () => {
    if (needsPin && !isCompletePin(pin)) {
      setPinError(PIN_MESSAGE.pin_requerido);
      return;
    }
    setPinError(null);
    const result = await onAdvance(order, needsPin ? pin : undefined);
    if (result === "ok") setPin("");
    else if (result !== "error") setPinError(PIN_MESSAGE[result]);
  };

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
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_TONE[order.estado]}`}>{statusLabel(order.estado, order.metodo_pago)}</span>
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

      {isCash(order.metodo_pago) && order.estado !== "entregado" && order.estado !== "cancelado" && (
        <p className="flex items-start gap-2 rounded-control bg-warning-soft p-3 text-sm font-medium text-warning">
          <CashIcon size={18} className="mt-0.5 shrink-0" />
          <span>
            Paga en efectivo: quien entrega cobra {formatPrice(order.monto_total)} en mano.
            {order.repartidor_nombre ? ` Lo entrega ${order.repartidor_nombre}.` : ""}
          </span>
        </p>
      )}

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

      {onAssign && couriers && couriers.length > 0 && canAssignCourier(order.estado) ? (
        <label className="block text-sm font-medium">
          Quién lo entrega
          <select
            value={order.repartidor_id ?? ""}
            disabled={busy}
            onChange={(e) => onAssign(order, e.target.value || null)}
            className="field mt-1"
          >
            <option value="">Lo entrego yo / retira el comprador</option>
            {couriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({VEHICLE_LABEL[c.tipo_vehiculo] ?? c.tipo_vehiculo})
              </option>
            ))}
          </select>
        </label>
      ) : (
        order.repartidor_nombre && <p className="text-sm text-muted">Lo entrega {order.repartidor_nombre}.</p>
      )}

      {needsPin && (
        <div>
          <label htmlFor={`pin-${order.id}`} className="block text-sm font-medium">
            Código de entrega
          </label>
          <input
            id={`pin-${order.id}`}
            inputMode="numeric"
            autoComplete="off"
            maxLength={PIN_LENGTH}
            value={pin}
            onChange={(e) => setPin(sanitizePin(e.target.value))}
            aria-invalid={pinError ? true : undefined}
            aria-describedby={`pin-${order.id}-msg`}
            className="field mt-1 w-32 text-center font-display text-lg tracking-widest tabular-nums"
            placeholder="0000"
          />
          <p id={`pin-${order.id}-msg`} className={`mt-1 text-sm ${pinError ? "text-danger" : "text-muted"}`} role={pinError ? "alert" : undefined}>
            {pinError ?? "Pedíselo al comprador al entregar."}
          </p>
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
          {onCancel && canCancelAndRefund(order.estado) && (
            <button type="button" onClick={() => setConfirmingCancel(true)} disabled={busy} className="btn btn-secondary btn-sm">
              Cancelar y reembolsar
            </button>
          )}
          {step && (
            <button
              type="button"
              onClick={advance}
              disabled={busy}
              aria-busy={busy}
              className="btn btn-primary btn-sm"
            >
              {step.label}
            </button>
          )}
        </div>
      </footer>
      <ConfirmDialog
        isOpen={confirmingCancel}
        onClose={() => setConfirmingCancel(false)}
        onConfirm={async () => {
          await onCancel?.(order);
          setConfirmingCancel(false);
        }}
        isLoading={busy}
        title={`¿Cancelar el pedido ${order.numero_pedido}?`}
        description={`Le devolvemos ${formatPrice(order.monto_total)} a ${order.comprador_nombre} por Mercado Pago. Esta acción no se puede deshacer.`}
        confirmText="Cancelar y reembolsar"
        cancelText="Volver"
      />
    </article>
  );
}
