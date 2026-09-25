"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/lib/cart/cart-context";
import type { LatLng } from "@/lib/domain/geo";
import { getCurrentPosition, type GeolocationFailure } from "@/lib/geolocation/geolocation";
import { ordersRepository } from "@/lib/orders/orders-repository";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { MapPinIcon } from "@/components/ui/icons";

export function CheckoutForm() {
  const router = useRouter();
  const { items, emprendimientoId, clearCart } = useCart();
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
    if (!emprendimientoId || items.length === 0) return;
    setError(null);
    setLoading(true);

    try {
      // La base valida disponibilidad y calcula precios y envío; acá solo se indica qué y cuánto.
      const order = await ordersRepository.create({
        emprendimientoId,
        items: items.map((i) => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
        direccion: form.direccion,
        nota: [form.telefono && `Tel: ${form.telefono}`, form.notas].filter(Boolean).join(" · "),
        ubicacion: ubicacion ?? undefined,
      });

      // El pedido ya existe: el carrito se vacía aunque el pago todavía no esté habilitado.
      clearCart();

      const response = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: order.pedidoId }),
      });

      if (!response.ok) {
        router.push(`/confirmacion?pedido=${order.pedidoId}&status=unpaid`);
        return;
      }

      const { url } = (await response.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos procesar el pedido");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <h2 className="text-heading">Datos de entrega</h2>

      {error && <Alert tone="error">{error}</Alert>}

      <Field id="telefono" label="Teléfono de contacto">
        <input id="telefono" type="tel" autoComplete="tel" required value={form.telefono} onChange={update("telefono")} placeholder="3704 123456" className="field" />
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
        <textarea id="notas" rows={2} value={form.notas} onChange={update("notas")} placeholder="Ej: tocar timbre, horario preferido" className="field" />
      </Field>

      <Alert tone="info">Vas a pagar de forma segura con MercadoPago. Tu pedido se confirma cuando se acredita el pago.</Alert>

      <button type="submit" disabled={loading} className="btn btn-primary w-full !py-3">
        {loading ? "Creando tu pedido…" : "Pagar con MercadoPago"}
      </button>
    </form>
  );
}
