"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "@/components/productor/product-form";
import { ProductList } from "@/components/productor/product-list";
import type { Database } from "@/lib/supabase/types";

type Emprendimiento = Database["public"]["Tables"]["emprendimientos"]["Row"];

export default function ProductorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [selectedEmprendimiento, setSelectedEmprendimiento] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadEmprendimientos();
    }
  }, [user]);

  const loadEmprendimientos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("emprendimientos")
        .select("*")
        .eq("owner_id", user?.id || "")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const emps = (data || []) as Emprendimiento[];
      setEmprendimientos(emps);
      if (emps && emps.length > 0) {
        setSelectedEmprendimiento(emps[0].id);
      }
    } catch (err) {
      console.error("Error cargando emprendimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-narrow mx-auto text-center py-12">
        <p className="text-muted">Debes estar logueado para acceder a tu dashboard.</p>
      </div>
    );
  }

  if (emprendimientos.length === 0) {
    return (
      <div className="max-w-narrow mx-auto text-center py-12">
        <h1 className="text-title mb-4">No tienes emprendimientos</h1>
        <p className="text-muted">Completa tu perfil para comenzar a vender.</p>
        <a
          href="/setup"
          className="mt-6 inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
        >
          Completar perfil
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-title mb-4">Mi catálogo</h1>

        <div className="mb-6 p-4 rounded-card border border-border bg-surface">
          <label className="block text-sm font-medium text-foreground mb-2">
            Selecciona un emprendimiento
          </label>
          <select
            value={selectedEmprendimiento}
            onChange={(e) => setSelectedEmprendimiento(e.target.value)}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {emprendimientos.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-heading">Productos</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-sm rounded-control bg-highlight px-3 py-1 font-medium text-on-highlight hover:opacity-90"
            >
              {showForm ? "Cerrar" : "+ Nuevo"}
            </button>
          </div>

          {selectedEmprendimiento && (
            <>
              {showForm && (
                <div className="mb-6 rounded-card border border-border bg-surface p-6">
                  <ProductForm
                    emprendimientoId={selectedEmprendimiento}
                    onSuccess={() => {
                      setShowForm(false);
                    }}
                  />
                </div>
              )}

              <ProductList emprendimientoId={selectedEmprendimiento} />
            </>
          )}
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <h3 className="text-heading mb-3">Información</h3>
          {emprendimientos.find((e) => e.id === selectedEmprendimiento) && (
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted">Nombre</p>
                <p className="font-medium">
                  {emprendimientos.find((e) => e.id === selectedEmprendimiento)?.nombre}
                </p>
              </div>
              <div>
                <p className="text-muted">Teléfono</p>
                <p className="font-medium">
                  {emprendimientos.find((e) => e.id === selectedEmprendimiento)?.telefono ||
                    "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-muted">Email</p>
                <p className="font-medium">
                  {emprendimientos.find((e) => e.id === selectedEmprendimiento)?.email ||
                    "No especificado"}
                </p>
              </div>
              <button className="mt-4 w-full text-sm rounded-control border border-border px-3 py-2 text-foreground hover:bg-surface-muted">
                Editar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
