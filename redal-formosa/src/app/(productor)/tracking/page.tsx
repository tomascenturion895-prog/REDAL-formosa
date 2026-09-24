"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { RepartidorTracker } from "@/components/tracking/repartidor-tracker";
import { PageHeader } from "@/components/layout/page-header";
import type { Database } from "@/lib/supabase/types";

type Pedido = Database["public"]["Tables"]["pedidos"]["Row"];

export default function RepartidorTrackingPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [repartidor, setRepartidor] = useState<any>(null);
  const [asignedPedidos, setAsignedPedidos] = useState<Pedido[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user) {
      setError("No autorizado");
      return;
    }

    try {
      setLoading(true);

      // Obtener datos del repartidor
      const { data: repartidorData, error: repartidorErr } = await supabase
        .from("repartidores")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (repartidorErr && repartidorErr.code !== "PGRST116") throw repartidorErr;

      if (!repartidorData) {
        setError("No eres un repartidor registrado");
        return;
      }

      setRepartidor(repartidorData);

      // Obtener pedidos asignados
      const { data: pedidosData, error: pedidosErr } = await (supabase
        .from("pedidos")
        .select("*")
        .eq("repartidor_id", (repartidorData as any).id)
        .in("estado", ["confirmado", "en_entrega"]) as any);

      if (pedidosErr) throw pedidosErr;
      setAsignedPedidos(pedidosData || []);

      if (pedidosData && pedidosData.length > 0) {
        setSelectedPedido(pedidosData[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-section">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-section">
        <div className="text-center text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <PageHeader
        title="Mi Seguimiento"
        description="Gestiona tu ubicación y pedidos en entrega"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Información del repartidor */}
        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-heading mb-4">👤 Mi Información</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">Nombre</p>
              <p className="font-semibold text-foreground mt-1">
                {repartidor?.nombre || "No registrado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">Teléfono</p>
              <p className="font-semibold text-foreground mt-1">
                {repartidor?.telefono || "No registrado"}
              </p>
            </div>
          </div>
        </div>

        {/* Pedidos asignados */}
        {asignedPedidos.length > 0 ? (
          <>
            <div className="rounded-card border border-border bg-surface p-6">
              <h2 className="text-heading mb-4">📋 Pedidos en Entrega</h2>

              <div className="space-y-3">
                {asignedPedidos.map((pedido) => (
                  <button
                    key={pedido.id}
                    onClick={() => setSelectedPedido(pedido)}
                    className={`w-full text-left p-4 rounded-control border transition-colors ${
                      selectedPedido?.id === pedido.id
                        ? "border-action bg-action-soft"
                        : "border-border bg-surface-muted hover:bg-surface"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{pedido.numero_pedido}</p>
                        <p className="text-sm text-muted mt-1">
                          {pedido.direccion_entrega}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-control ${
                          (pedido.estado as any) === "en_entrega"
                            ? "bg-info-soft text-info"
                            : "bg-success-soft text-success"
                        }`}
                      >
                        {(pedido.estado as any) === "en_entrega" ? "En entrega" : "Confirmado"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking del pedido seleccionado */}
            {selectedPedido && (
              <div>
                <h2 className="text-heading mb-4">🗺️ Tracking en Vivo</h2>
                <RepartidorTracker
                  repartidorId={repartidor.id}
                  destino={{ lat: -25.4971, lng: -55.504 }}
                  isRepartidor={true}
                />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-card border border-border bg-surface-muted p-6 text-center">
            <p className="text-muted">
              No tienes pedidos asignados en este momento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
