"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";

interface CheckoutFormProps {
  monto: number;
  direccion: string;
  onSuccess?: (pedidoId: string) => void;
}

export function CheckoutForm({ monto, direccion, onSuccess }: CheckoutFormProps) {
  const { user } = useAuth();
  const { items, emprendimientoId, clearCart } = useCart();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: direccion,
    notas: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) throw new Error("Debes estar logueado para hacer una compra");
      if (!emprendimientoId) throw new Error("Selecciona un emprendimiento");
      if (items.length === 0) throw new Error("Tu carrito está vacío");

      // Generar número de pedido
      const numeroPedido = `PED-${Date.now()}`;

      // Crear pedido en la BD
      const { data: pedido, error: pedidoErr } = await (supabase
        .from("pedidos")
        .insert({
          numero_pedido: numeroPedido,
          comprador_id: user.id,
          emprendimiento_id: emprendimientoId,
          estado: "pendiente_pago",
          tipo_entrega: "domicilio",
          direccion_entrega: formData.direccion,
          monto_total: monto,
          nota_cliente: formData.notas,
        } as any) as any)
        .select()
        .single();

      if (pedidoErr) throw pedidoErr;

      // Crear items del pedido
      for (const item of items) {
        const { error: itemErr } = await (supabase
          .from("pedido_items")
          .insert({
            pedido_id: pedido.id,
            producto_id: item.producto.id,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio,
            subtotal: item.producto.precio * item.cantidad,
          } as any) as any);

        if (itemErr) throw itemErr;
      }

      // Crear pago pendiente
      const { data: pago, error: pagoErr } = await (supabase
        .from("pagos")
        .insert({
          pedido_id: pedido.id,
          monto: monto,
          estado: "pendiente",
          proveedor: "mercadopago",
        } as any) as any);

      if (pagoErr) throw pagoErr;

      // Obtener items del pedido para la preferencia
      const { data: pedidoItems, error: itemsErr } = await supabase
        .from("pedido_items")
        .select("*, producto:productos(*)")
        .eq("pedido_id", pedido.id);

      if (itemsErr) throw itemsErr;

      // Crear preferencia en MercadoPago
      const mpResponse = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: pedido.id,
          monto: monto,
          items: pedidoItems?.map((item: any) => ({
            nombre: item.producto?.nombre || "Producto",
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            producto_id: item.producto_id,
          })) || [],
        }),
      });

      if (!mpResponse.ok) {
        throw new Error("Error creating MercadoPago preference");
      }

      const { initPoint, sandboxUrl } = await mpResponse.json();
      const mpUrl = initPoint || sandboxUrl;

      if (!mpUrl) {
        throw new Error("No payment URL available");
      }

      // Redirigir a MercadoPago
      clearCart();
      window.location.href = mpUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-heading">Datos de entrega</h2>

      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-1">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Tu nombre"
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="tu@email.com"
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-1">
          Teléfono
        </label>
        <input
          id="telefono"
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          required
          placeholder="+54 3764 123456"
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-foreground mb-1">
          Dirección de entrega
        </label>
        <textarea
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          required
          placeholder="Calle, número, piso, apartamento..."
          rows={3}
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-foreground mb-1">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          placeholder="Ej: Tocar timbre con cuidado..."
          rows={2}
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="bg-info-soft rounded-control p-4 text-sm text-info">
        <p className="font-medium">Información de pago</p>
        <p className="mt-1">
          Serás redirigido a MercadoPago para completar el pago de forma segura.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-control bg-action px-5 py-3 font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover disabled:opacity-60"
      >
        {loading ? "Procesando..." : "Ir a pagar con MercadoPago"}
      </button>
    </form>
  );
}
