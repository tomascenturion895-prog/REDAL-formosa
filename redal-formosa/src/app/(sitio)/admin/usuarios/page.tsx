"use client";

import { useState } from "react";

import { adminRepository, type AdminUser } from "@/lib/admin/admin-repository";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import type { UserRole } from "@/lib/supabase/types";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ROLE_LABEL: Record<UserRole, string> = {
  comprador: "Comprador",
  emprendedor: "Emprendedor",
  admin: "Administrador",
};

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const { data: users, error: loadError, reload } = useAsync(() => adminRepository.users(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ target: AdminUser; nextRole: UserRole } | null>(null);

  const confirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    const { target, nextRole } = roleChangeTarget;
    setBusy(target.id);
    setError(null);
    try {
      await adminRepository.setRole(target.id, nextRole);
      setRoleChangeTarget(null);
      reload();
    } catch {
      setError("No se pudo cambiar el rol.");
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return <Alert tone="error">No pudimos cargar los usuarios.</Alert>;
  if (!users) return <div aria-busy="true" className="h-40" />;

  const actionText = roleChangeTarget?.nextRole === "admin"
    ? "dar permisos de administrador a"
    : "quitar permisos de administrador a";

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Usuarios registrados</caption>
          <thead className="border-b border-border bg-surface-muted text-left text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
              <th scope="col" className="px-4 py-3 font-medium">Rol</th>
              <th scope="col" className="px-4 py-3 font-medium">Pedidos</th>
              <th scope="col" className="px-4 py-3 font-medium">Registro</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{u.full_name || "Sin nombre"}</p>
                  <p className="text-muted">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.role === "admin" ? "bg-warning-soft text-warning" : "bg-surface-muted text-muted"
                    }`}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{u.cantidad_pedidos}</td>
                <td className="px-4 py-3 text-muted">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user?.id && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy === u.id}
                      onClick={() => setRoleChangeTarget({ target: u, nextRole: u.role === "admin" ? "comprador" : "admin" })}
                    >
                      {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(roleChangeTarget)}
        onClose={() => setRoleChangeTarget(null)}
        onConfirm={confirmRoleChange}
        title={roleChangeTarget?.nextRole === "admin" ? "¿Asignar rol de Administrador?" : "¿Quitar rol de Administrador?"}
        description={`¿Estás seguro de que querés ${actionText} ${roleChangeTarget?.target.email}?`}
        confirmText={roleChangeTarget?.nextRole === "admin" ? "Hacer admin" : "Quitar admin"}
        isDestructive={roleChangeTarget?.nextRole !== "admin"}
        isLoading={Boolean(busy)}
      />
    </div>
  );
}
