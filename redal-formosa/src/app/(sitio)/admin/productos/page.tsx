"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { adminService } from "@/lib/admin/admin-service";

export default function AdminProductosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
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
    loadProducts();
  };

  const loadProducts = async () => {
    try {
      const data = await adminService.getPendingProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    setProcesando(productId);
    const success = await adminService.approveProduct(productId);
    if (success) setProducts(products.filter((p) => p.id !== productId));
    setProcesando(null);
  };

  if (authLoading || loading) return <div className="text-center py-12">Cargando...</div>;
  if (!isAdmin) return <div className="text-center py-12 text-danger">No autorizado</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📦 Validar Productos</h1>
      {products.length === 0 ? (
        <div className="rounded-card border border-border bg-surface-muted p-8 text-center">
          <p className="text-muted">✓ Sin productos pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-card border border-border bg-surface p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{p.nombre}</h3>
                  <p className="text-sm text-muted mt-1">${p.precio}</p>
                </div>
                <button
                  onClick={() => handleApprove(p.id)}
                  disabled={procesando === p.id}
                  className="rounded-control bg-success px-4 py-2 text-sm font-medium text-on-success hover:opacity-90 disabled:opacity-60"
                >
                  ✓ Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
