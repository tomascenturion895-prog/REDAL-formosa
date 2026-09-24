"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { RepartidorTracker } from "@/components/tracking/repartidor-tracker";
import { PageHeader } from "@/components/layout/page-header";
import type { Database } from "@/lib/supabase/types";

type Pedido = Database["public"]["Tables"]["pedidos"]["Row"];
type Repartidor = Database["public"]["Tables"]["repartidores"]["Row"];

export default function TrackingPage() {
  const params = useParams();
  const pedidoId = params.pedidoId as string;
  const { user } = useAuth();
  const supabase = createClient();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [pedidoId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Obtener pedido
      const { data: pedidoData, error: pedidoErr } = await supabase
        .from("pedidos")
        .select("*")
        .eq("id", pedidoId)
        .single();

      if (pedidoErr) throw pedidoErr;
      setPedido(pedidoData);

      // Obtener repartidor asignado
      const { data: repartidorData, error: repartidorErr } = await supabase
        .from("repartidores")
        .select("*")
        .eq("pedido_id", pedidoId)
        .single();

      if (repartidorErr && repartidorErr.code !== "PGRST116") throw repartidorErr;
      setRepartidor(repartidorData || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-section">
        <div className="text-center">Cargando seguimiento...</div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="page-container py-section">
        <div className="text-center">
          <p className="text-muted mb-4">Pedido no encontrado</p>
          <a
            href="/emprendimientos"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Volver al catálogo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <PageHeader
        title="Seguimiento de Pedido"
        description={`Pedido ${pedido.numero_pedido}`}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Estado del pedido */}
        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-heading mb-4">📦 Estado del Pedido</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">Número de pedido</p>
              <p className="font-semibold text-foreground mt-1">
                {pedido.numero_pedido}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted">Estado</p>
              <p className="font-semibold text-foreground mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    (pedido.estado as any) === "confirmado"
                      ? "bg-success-soft text-success"
                      : (pedido.estado as any) === "en_entrega"
                      ? "bg-info-soft text-info"
                      : "bg-warning-soft text-warning"
                  }`}
                >
                  {(pedido.estado as any) === "confirmado"
                    ? "✓ Confirmado"
                    : (pedido.estado as any) === "en_entrega"
                    ? "🚗 En entrega"
                    : "⏳ Pendiente"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-sm text-muted">Dirección de entrega</p>
              <p className="text-foreground mt-1">{pedido.direccion_entrega}</p>
            </div>

            <div>
              <p className="text-sm text-muted">Monto total</p>
              <p className="font-semibold text-action text-lg mt-1">
                ${pedido.monto_total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking del repartidor */}
        {repartidor ? (
          <RepartidorTracker
            repartidorId={repartidor.id}
            destino={{ lat: -25.4971, lng: -55.504 }} // Coordenadas de ejemplo (Formosa)
            isRepartidor={false}
          />
        ) : (
          <div className="rounded-card border border-border bg-surface-muted p-6 text-center">
            <p className="text-muted">
              {(pedido.estado as any) === "confirmado"
                ? "Tu pedido aún no ha sido asignado a un repartidor"
                : "Tu pedido está siendo procesado"}
            </p>
          </div>
        )}

        {/* Información de contacto */}
        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-heading mb-4">📞 ¿Necesitas ayuda?</h2>
          <p className="text-muted mb-4">
            Si tienes problemas con tu pedido, contáctanos:
          </p>
          <div className="space-y-2">
            <a
              href="tel:+54"
              className="block text-link hover:underline"
            >
              Llamar al equipo de soporte
            </a>
            <a
              href="mailto:soporte@redal.com"
              className="block text-link hover:underline"
            >
              Email: soporte@redal.com
            </a>
          </div>
        </div>

        <a
          href="/emprendimientos"
          className="inline-block text-link hover:underline"
        >
          ← Volver al catálogo
        </a>
      </div>
    </div>
  );
}
