"use client";

import { useState } from "react";
import Link from "next/link";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { useAsync } from "@/lib/hooks/use-async";
import { producerRepository } from "@/lib/producer/producer-repository";
import { ProductForm } from "@/components/productor/product-form";
import { ProductList } from "@/components/productor/product-list";
import { SucursalesForm } from "@/components/productor/sucursales-form";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PlusIcon, StoreIcon } from "@/components/ui/icons";

export default function ProductorDashboard() {
  const { user, pending } = useRequireAuth();
  const { data: emprendimientos, loading, reload } = useAsync(() => producerRepository.ownEmprendimientos(user!.id), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [listVersion, setListVersion] = useState(0);

  if (pending || loading) return <div aria-busy="true" className="h-40" />;

  if (!emprendimientos || emprendimientos.length === 0) {
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

  const selected = emprendimientos.find((e) => e.id === selectedId) ?? emprendimientos[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title">Mi emprendimiento</h1>
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
            <p className="mt-1 text-muted">{selected.nombre}</p>
          )}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <PlusIcon size={18} />
          {showForm ? "Cerrar formulario" : "Nuevo producto"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="products-title" className="space-y-4">
          <h2 id="products-title" className="text-heading">
            Productos
          </h2>

          {showForm && (
            <div className="card space-y-4 p-6">
              <Alert tone="info">Los productos nuevos se publican cuando un administrador los revisa.</Alert>
              <ProductForm
                emprendimientoId={selected.id}
                onSuccess={() => {
                  setShowForm(false);
                  setListVersion((v) => v + 1);
                }}
              />
            </div>
          )}

          <ProductList key={`${selected.id}-${listVersion}`} emprendimientoId={selected.id} />
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
          <details className="rounded-control border border-border">
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
    </div>
  );
}
