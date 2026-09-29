"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart, type CartGroup } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import type { LatLng } from "@/lib/domain/geo";
import { getCurrentPosition, type GeolocationFailure } from "@/lib/geolocation/geolocation";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { CashIcon, LockIcon, MapPinIcon } from "@/components/ui/icons";
import { PaymentMethods, type PaymentMethodId } from "@/components/payment/payment-methods";

export function CheckoutForm({
  group,
  onOrderCreated,
}: {
  group: CartGroup;
  onOrderCreated: (order: { id: string; monto: number; emprendimientoId: string }) => void;
}) {
  const router = useRouter();
  const { clearStore } = useCart();
  const { items, emprendimientoId, total } = group;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("mercadopago_tarjeta");
  const [form, setForm] = useState({ telefono: "", direccion: "", notas: "" });
  const [ubicacion, setUbicacion] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);

  const shareLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const position = await getCurrentPosition();
      setUbicacion({ lat: position.latitude, lng: position.longitude });
    } catch (failure) {
      setError((failure as GeolocationFailure).message ?? "No pudimos obtener tu ubicación");
    } finally {
      setLocating(false);
    }
  };

  const update =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError(null);
    setLoading(true);

    try {
      const metodoTexto =
        paymentMethod === "efectivo"
          ? "Pago en efectivo contra entrega"
          : `Mercado Pago (${paymentMethod.replace("mercadopago_", "")})`;

      const notaCompleta = [
        form.telefono && `Tel: ${form.telefono}`,
        `Medio: ${metodoTexto}`,
        form.notas,
      ]
        .filter(Boolean)
        .join(" · ");

      const order = await ordersRepository.create({
        emprendimientoId,
        items: items.map((i) => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
        direccion: form.direccion,
        nota: notaCompleta,
        ubicacion: ubicacion ?? undefined,
      });

      if (paymentMethod === "efectivo") {
        clearStore(emprendimientoId);
        router.push(`/confirmacion?pedido=${order.pedidoId}&metodo=efectivo`);
        return;
      }

      // Para Mercado Pago notificamos al componente padre
      onOrderCreated({
        id: order.pedidoId,
        monto: total,
        emprendimientoId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos procesar el pedido");
      setLoading(false);
    }
  };

  const isCash = paymentMethod === "efectivo";

  return (
    <form onSubmit={handleSubmit} data-no-progress="true" className="card space-y-5 p-6">
      <h2 className="text-heading">Datos de entrega</h2>

      {error && <Alert tone="error">{error}</Alert>}

      <Field id="telefono" label="Teléfono de contacto">
        <input
          id="telefono"
          type="tel"
          autoComplete="tel"
          required
          value={form.telefono}
          onChange={update("telefono")}
          placeholder="3704 123456"
          className="field"
        />
      </Field>

      <Field id="direccion" label="Dirección de entrega">
        <textarea
          id="direccion"
          required
          rows={3}
          autoComplete="street-address"
          value={form.direccion}
          onChange={update("direccion")}
          placeholder="Calle, número, barrio y referencias"
          className="field"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={shareLocation} disabled={locating} className="btn btn-secondary btn-sm">
          <MapPinIcon size={16} />
          {locating ? "Buscando tu ubicación…" : ubicacion ? "Actualizar mi ubicación" : "Usar mi ubicación actual"}
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {ubicacion
            ? "Ubicación guardada: el repartidor va a ver el punto exacto en el mapa."
            : "Opcional: ayuda a que el repartidor llegue al lugar exacto."}
        </p>
      </div>

      <Field id="notas" label="Notas para el emprendedor" optional>
        <textarea
          id="notas"
          rows={2}
          value={form.notas}
          onChange={update("notas")}
          placeholder="Ej: tocar timbre, horario preferido"
          className="field"
        />
      </Field>

      <PaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-4 !text-base">
        {loading ? (
          "Procesando pedido…"
        ) : isCash ? (
          <>
            <CashIcon size={18} />
            Confirmar pedido · Pagar {formatPrice(total)} en efectivo
          </>
        ) : (
          <>
            <LockIcon size={18} />
            Pagar {formatPrice(total)} con Mercado Pago
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted">
        {isCash
          ? "Al confirmar, el productor comenzará a preparar tu pedido para entregártelo."
          : "Al hacer clic, podrás escanear el QR desde tu celular o pagar directo en Mercado Pago."}
      </p>
    </form>
  );
}
