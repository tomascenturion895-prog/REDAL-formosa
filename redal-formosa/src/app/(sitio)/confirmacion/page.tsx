"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Pedido = Database["public"]["Tables"]["pedidos"]["Row"];

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const supabase = createClient();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pedidoId) {
      loadPedido();
    }
  }, [pedidoId]);

  const loadPedido = async () => {
    if (!pedidoId) return;
    try {
      const { data, error: err } = await supabase
        .from("pedidos")
        .select("*")
        .eq("id", pedidoId)
        .single();

      if (err) throw err;
      setPedido(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando pedido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container py-section text-center">Cargando...</div>;
  }

  if (!pedido) {
    return (
      <div className="page-container py-section">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted">Pedido no encontrado</p>
          <a
            href="/emprendimientos"
            className="mt-4 inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Volver al catálogo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-card border border-success bg-surface p-8 text-center mb-8">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-title text-success mb-2">¡Pedido confirmado!</h1>
          <p className="text-muted">Tu pedido ha sido registrado correctamente.</p>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 space-y-4">
          <div>
            <p className="text-sm text-muted">Número de pedido</p>
            <p className="text-lg font-semibold text-foreground">{pedido.numero_pedido}</p>
          </div>

          <div>
            <p className="text-sm text-muted">Estado</p>
            <p className="inline-block mt-1 px-3 py-1 rounded-full bg-info-soft text-info text-sm font-medium">
              Pendiente de pago
            </p>
          </div>

          <div>
            <p className="text-sm text-muted">Monto total</p>
            <p className="text-2xl font-bold text-action">${pedido.monto_total.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-sm text-muted">Dirección de entrega</p>
            <p className="text-foreground mt-1">{pedido.direccion_entrega}</p>
          </div>

          {pedido.nota_cliente && (
            <div>
              <p className="text-sm text-muted">Notas</p>
              <p className="text-foreground mt-1">{pedido.nota_cliente}</p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <div className="rounded-control bg-info-soft p-4 text-sm text-info">
            <p className="font-medium">¿Qué sigue?</p>
            <p className="mt-2">
              Recibirás un email de confirmación con los detalles de tu pedido y el estado de tu entrega.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/emprendimientos"
              className="flex-1 rounded-control bg-action px-4 py-3 font-medium text-on-action text-center hover:bg-action-hover"
            >
              Seguir comprando
            </a>
            <a
              href="/"
              className="flex-1 rounded-control border border-border px-4 py-3 font-medium text-foreground text-center hover:bg-surface-muted"
            >
              Volver a inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="page-container py-section text-center">Cargando...</div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
