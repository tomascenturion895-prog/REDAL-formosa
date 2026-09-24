"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { adminService, type AdminStats } from "@/lib/admin/admin-service";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const admin = await adminService.isAdmin(user.id);
    if (!admin) {
      router.push("/");
      return;
    }

    setIsAdmin(true);
    loadStats();
  };

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!isAdmin) {
    return <div className="text-center py-12 text-danger">No autorizado</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Bienvenido al Panel de Admin</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Usuarios" value={stats?.total_usuarios || 0} icon="👥" />
        <StatCard label="Productos" value={stats?.total_productos || 0} icon="📦" />
        <StatCard label="Pedidos" value={stats?.total_pedidos || 0} icon="📋" />
        <StatCard label="Calificaciones" value={stats?.total_calificaciones || 0} icon="⭐" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-heading mb-4">💰 Ingresos</h2>
          <p className="text-3xl font-bold text-action">${(stats?.ingresos_totales || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-heading mb-4">🚚 En Tránsito</h2>
          <p className="text-3xl font-bold text-highlight">{stats?.pedidos_en_entrega || 0}</p>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="text-heading mb-4">⚡ Acciones</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <a href="/admin/productos" className="rounded-control bg-action px-4 py-3 text-center font-medium text-on-action hover:bg-action-hover">
            📦 Validar
          </a>
          <a href="/admin/usuarios" className="rounded-control bg-highlight px-4 py-3 text-center font-medium text-on-highlight hover:opacity-90">
            👥 Usuarios
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-6">
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
    </div>
  );
}
