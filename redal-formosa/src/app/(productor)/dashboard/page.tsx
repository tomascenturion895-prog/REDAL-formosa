"use client";

import { useState } from "react";
import Link from "next/link";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { useAsync } from "@/lib/hooks/use-async";
import { sellerOrdersRepository } from "@/lib/orders/seller-orders-repository";
import { producerRepository } from "@/lib/producer/producer-repository";
import { ProductForm } from "@/components/productor/product-form";
import { ProductList } from "@/components/productor/product-list";
import { SucursalesForm } from "@/components/productor/sucursales-form";
import { TodayPanel, type ChecklistItem } from "@/components/productor/today-panel";
import { VoiceQuickAdd } from "@/components/productor/voice-quick-add";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { MicIcon, PlusIcon, StoreIcon } from "@/components/ui/icons";

export default function ProductorDashboard() {
  const { user, pending } = useRequireAuth();
  const { data: emprendimientos, loading, reload } = useAsync(() => producerRepository.ownEmprendimientos(user!.id), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const selected = emprendimientos?.find((e) => e.id === selectedId) ?? emprendimientos?.[0];

  const { data: products, reload: reloadProducts } = useAsync(
    () => producerRepository.listProducts(selected!.id),
    [selected?.id],
    { enabled: Boolean(selected), scope: selected?.id },
  );
  const { data: orders } = useAsync(() => sellerOrdersRepository.list(), [user?.id], { enabled: Boolean(user), scope: user?.id });
  const { data: payout } = useAsync(() => producerRepository.payoutReadiness(user!.id), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });

  if (pending || loading) return <div aria-busy="true" className="h-40" />;

  if (!emprendimientos || emprendimientos.length === 0 || !selected) {
    return (
      <EmptyState
        icon={<StoreIcon size={36} />}
        title="Todavía no tenés un emprendimiento"
        description="Creá el perfil de tu emprendimiento para empezar a vender."
        action={
          <Link href="/setup" className="btn btn-primary">
            Sumar mi emprendimiento
          </Link>
        }
      />
    );
  }

  const list = products ?? [];
  const checklist: ChecklistItem[] = [
    { key: "ubicacion", label: "Ubicá tu emprendimiento en el mapa", done: selected.latitud != null && selected.longitud != null, href: "#ubicacion", cta: "Ubicar" },
    { key: "producto", label: "Cargá tu primer producto", done: list.length > 0, href: "#cargar-por-voz", cta: "Cargar" },
    { key: "verificacion", label: "Verificá tu identidad", done: payout?.verification === "approved" || payout?.verification === "pending_review", href: "/setup?paso=verificacion", cta: "Verificar" },
    { key: "cobro", label: "Cargá la cuenta donde cobrás", done: Boolean(payout?.hasBankAccount), href: "/setup?paso=cobro", cta: "Cargar cuenta" },
  ];
  // Mientras se consulta el estado de cobro no se muestran como pendientes los pasos que dependen de él.
  const visibleChecklist = payout ? checklist : checklist.filter((item) => item.key === "ubicacion" || item.key === "producto");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title">Hoy en {selected.nombre}</h1>
          {emprendimientos.length > 1 ? (
            <div className="mt-2">
              <label htmlFor="emp-select" className="sr-only">
                Emprendimiento
              </label>
              <select id="emp-select" value={selected.id} onChange={(e) => setSelectedId(e.target.value)} className="field !w-auto">
                {emprendimientos.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="mt-1 text-muted">Lo que necesitás ver al abrir la app.</p>
          )}
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setShowForm((v) => !v)}>
          <PlusIcon size={18} />
          {showForm ? "Cerrar formulario" : "Nuevo producto con foto"}
        </button>
      </div>

      <TodayPanel
        orders={orders}
        published={list.filter((p) => p.validado && p.disponible).length}
        inReview={list.filter((p) => !p.validado && !p.razon_rechazo).length}
        checklist={visibleChecklist}
      />

      <VoiceQuickAdd emprendimientoId={selected.id} onCreated={reloadProducts} />

      {showForm && (
        <div className="card space-y-4 p-6">
          <Alert tone="info">Los productos nuevos se publican cuando un administrador los revisa.</Alert>
          <ProductForm
            emprendimientoId={selected.id}
            onSuccess={() => {
              setShowForm(false);
              reloadProducts();
            }}
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="products-title" className="space-y-4">
          <h2 id="products-title" className="text-heading">
            Mis productos
          </h2>
          <ProductList products={list} onChanged={reloadProducts} />
        </section>

        <aside className="card h-fit space-y-4 p-5 text-sm">
          <h2 className="text-heading">Datos de contacto</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-muted">Teléfono</dt>
              <dd className="font-medium">{selected.telefono || "Sin cargar"}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-medium">{selected.email || "Sin cargar"}</dd>
            </div>
            <div>
              <dt className="text-muted">Dirección</dt>
              <dd className="font-medium">{selected.direccion || "Sin cargar"}</dd>
            </div>
          </dl>
          <details id="ubicacion" className="rounded-control border border-border" open={selected.latitud == null}>
            <summary className="cursor-pointer px-3 py-2 font-medium">
              {selected.latitud != null && selected.longitud != null ? "Editar ubicación y horarios" : "Ubicar en el mapa"}
            </summary>
            <div className="border-t border-border p-3">
              <SucursalesForm
                key={selected.id}
                emprendimientoId={selected.id}
                initial={selected}
                submitLabel="Guardar ubicación"
                onSuccess={reload}
              />
            </div>
          </details>
          <Link href={`/emprendimientos/${selected.id}`} className="btn btn-secondary btn-sm w-full">
            Ver cómo lo ven los compradores
          </Link>
        </aside>
      </div>

      <a
        href="#cargar-por-voz"
        aria-label="Cargar un producto por voz"
        className="btn btn-primary fixed bottom-5 right-5 z-30 !h-14 !w-14 !rounded-full !p-0 shadow-pop lg:hidden"
      >
        <MicIcon size={24} />
      </a>
    </div>
  );
}
