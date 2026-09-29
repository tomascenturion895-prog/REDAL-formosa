"use client";

import { useState } from "react";

import { type CartGroup } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import type { LatLng } from "@/lib/domain/geo";
import { getCurrentPosition, type GeolocationFailure } from "@/lib/geolocation/geolocation";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { LockIcon, MapPinIcon } from "@/components/ui/icons";
import { PaymentMethods } from "@/components/payment/payment-methods";

export function CheckoutForm({
  group,
  onOrderCreated,
}: {
  group: CartGroup;
  onOrderCreated: (order: { id: string; monto: number; emprendimientoId: string }) => void;
}) {
  const { items, emprendimientoId, total } = group;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // El teléfono viaja en la nota: es lo que el vendedor usa para avisar al comprador.
      const notaCompleta = [form.telefono && `Tel: ${form.telefono}`, form.notas].filter(Boolean).join(" · ");

      const order = await ordersRepository.create({
        emprendimientoId,
        items: items.map((i) => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
        direccion: form.direccion,
        nota: notaCompleta,
        ubicacion: ubicacion ?? undefined,
      });

      // El padre muestra el paso de pago del pedido ya creado.
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

      <PaymentMethods />

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-4 !text-base">
        {loading ? (
          "Creando tu pedido…"
        ) : (
          <>
            <LockIcon size={18} />
            Continuar al pago · {formatPrice(total)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted">
        Primero creamos tu pedido y en el siguiente paso pagás con Mercado Pago. Si preferís hacerlo después, queda guardado en Mis pedidos.
      </p>
    </form>
  );
}
