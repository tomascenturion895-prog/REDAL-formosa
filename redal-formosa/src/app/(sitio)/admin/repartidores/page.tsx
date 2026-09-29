"use client";

import { useState } from "react";

import { adminRepository, type VehicleType } from "@/lib/admin/admin-repository";
import { useAsync } from "@/lib/hooks/use-async";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { TruckIcon } from "@/components/ui/icons";
import { PageLoading } from "@/components/ui/skeleton";

const VEHICLES: { value: VehicleType; label: string }[] = [
  { value: "bicicleta", label: "Bicicleta" },
  { value: "moto", label: "Moto" },
  { value: "auto", label: "Auto" },
  { value: "camion", label: "Camión" },
];

export default function AdminRepartidoresPage() {
  const { data: couriers, error: loadError, reload } = useAsync(() => adminRepository.couriers(), []);
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>("moto");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toRemove, setToRemove] = useState<{ id: string; email: string } | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminRepository.addCourier(email.trim(), vehicle);
      setEmail("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos dar de alta al repartidor.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toRemove) return;
    setSaving(true);
    setError(null);
    try {
      await adminRepository.deactivateCourier(toRemove.id);
      setToRemove(null);
      reload();
    } catch {
      setError("No pudimos dar de baja al repartidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loadError) return <Alert tone="error">No pudimos cargar los repartidores.</Alert>;
  if (!couriers) return <PageLoading compact />;

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={add} className="card grid gap-3 p-5 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
        <label className="block text-sm font-medium">
          Email de la cuenta
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="repartidor@ejemplo.com"
            className="field mt-1"
          />
        </label>
        <label className="block text-sm font-medium">
          Vehículo
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value as VehicleType)} className="field mt-1">
            {VEHICLES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving || !email.trim()}>
          Dar de alta
        </button>
        <p className="text-sm text-muted sm:col-span-3">La persona tiene que estar registrada en REDAL. Al darla de alta ve “Mis entregas” en su menú.</p>
      </form>

      {couriers.length === 0 ? (
        <EmptyState
          icon={<TruckIcon size={36} />}
          title="Todavía no hay repartidores"
          description="Sin repartidores, cada emprendimiento entrega por su cuenta."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Repartidores</caption>
            <thead className="border-b border-border bg-surface-muted text-left text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Repartidor</th>
                <th scope="col" className="px-4 py-3 font-medium">Vehículo</th>
                <th scope="col" className="px-4 py-3 font-medium">Entregas activas</th>
                <th scope="col" className="px-4 py-3 font-medium">Completadas</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {couriers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.full_name || "Sin nombre"}</p>
                    <p className="text-muted">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">{VEHICLES.find((v) => v.value === c.tipo_vehiculo)?.label}</td>
                  <td className="px-4 py-3 tabular-nums">{c.entregas_activas}</td>
                  <td className="px-4 py-3 tabular-nums">{c.viajes_completados}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.activo ? "bg-success-soft text-success" : "bg-surface-muted text-muted"}`}>
                      {c.activo ? "Activo" : "De baja"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.activo && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setToRemove({ id: c.id, email: c.email })}>
                        Dar de baja
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        onConfirm={remove}
        title="¿Dar de baja al repartidor?"
        description={`${toRemove?.email} deja de aparecer para los vendedores y no puede marcar entregas. Los pedidos que ya tenía asignados no se reasignan solos.`}
        confirmText="Dar de baja"
        isDestructive
        isLoading={saving}
      />
    </div>
  );
}
