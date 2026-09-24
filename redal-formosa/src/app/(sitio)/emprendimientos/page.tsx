"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { PageHeader } from "@/components/layout/page-header";

type Emprendimiento = Database["public"]["Tables"]["emprendimientos"]["Row"];

export default function EmprendimientosPage() {
  const supabase = createClient();
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEmprendimientos();
  }, []);

  const loadEmprendimientos = async () => {
    try {
      const { data, error } = await supabase
        .from("emprendimientos")
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmprendimientos(data || []);
    } catch (err) {
      console.error("Error cargando emprendimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = emprendimientos.filter((emp) =>
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container py-section">
      <PageHeader
        title="Emprendimientos"
        description="Descubre todos los emprendedores y productores locales de Formosa"
      />

      <div className="mb-8 max-w-sm">
        <input
          type="text"
          placeholder="Buscar emprendimiento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Cargando emprendimientos...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-border bg-surface-muted p-8 text-center">
          <p className="text-muted">
            {searchTerm ? "No se encontraron emprendimientos" : "No hay emprendimientos disponibles"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emprendimiento) => (
            <Link
              key={emprendimiento.id}
              href={`/emprendimientos/${emprendimiento.id}`}
              className="group rounded-card border border-border bg-surface overflow-hidden shadow-card hover:shadow-pop transition-all hover:-translate-y-1"
            >
              <div className="aspect-video bg-surface-muted flex items-center justify-center group-hover:bg-surface transition-colors">
                <span className="text-4xl">🏪</span>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-foreground group-hover:text-action transition-colors">
                  {emprendimiento.nombre}
                </h3>

                <p className="text-sm text-muted mt-2 line-clamp-2">
                  {emprendimiento.descripcion || "Sin descripción"}
                </p>

                {emprendimiento.telefono && (
                  <p className="text-xs text-muted mt-3">{emprendimiento.telefono}</p>
                )}

                <div className="mt-4 inline-block rounded-control bg-highlight px-3 py-1 text-sm font-medium text-on-highlight group-hover:opacity-90">
                  Ver productos →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
