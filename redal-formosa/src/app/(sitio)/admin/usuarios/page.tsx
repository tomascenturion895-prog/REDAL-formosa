"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { adminService } from "@/lib/admin/admin-service";

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, [user]);

  const checkAdminAndLoad = async () => {
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
    loadUsers();
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    if (!confirm("¿Promover a admin?")) return;
    setProcesando(userId);
    const success = await adminService.promoteToAdmin(userId);
    if (success) loadUsers();
    setProcesando(null);
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("¿Remover admin?")) return;
    setProcesando(userId);
    const success = await adminService.removeAdmin(userId);
    if (success) loadUsers();
    setProcesando(null);
  };

  if (authLoading || loading) return <div className="text-center py-12">Cargando...</div>;
  if (!isAdmin) return <div className="text-center py-12 text-danger">No autorizado</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">👥 Usuarios</h1>
      <div className="rounded-card border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      u.is_admin ? "bg-warning-soft text-warning" : "bg-surface-muted text-muted"
                    }`}>
                      {u.is_admin ? "👑 Admin" : "Usuario"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => u.is_admin ? handleRemoveAdmin(u.id) : handlePromoteAdmin(u.id)}
                      disabled={procesando === u.id}
                      className="text-xs text-link hover:underline disabled:opacity-60"
                    >
                      {u.is_admin ? "Remover" : "Promover"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
