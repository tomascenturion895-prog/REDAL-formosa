import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "../errors";

export type AppRole = "VENDEDOR" | "COMPRADOR" | "ADMIN";

/**
 * Rol efectivo de una persona. En la base el enum es comprador/emprendedor/admin, pero nadie pasa a
 * "emprendedor" al crear su emprendimiento, así que VENDEDOR = tiene al menos un emprendimiento
 * (o el rol emprendedor). ADMIN conserva acceso a las herramientas de vendedor.
 */
export async function resolveRole(db: Db, userId: string): Promise<AppRole> {
  const [{ data: profile }, { count }] = await Promise.all([
    db.from("profiles").select("role").eq("id", userId).maybeSingle(),
    db.from("emprendimientos").select("id", { count: "exact", head: true }).eq("owner_id", userId),
  ]);
  if (profile?.role === "admin") return "ADMIN";
  if (profile?.role === "emprendedor" || (count ?? 0) > 0) return "VENDEDOR";
  return "COMPRADOR";
}

/** Lanza 401 sin sesión y 403 si el rol no está permitido. */
export async function requireRole(db: Db, allowed: readonly AppRole[]): Promise<{ userId: string; role: AppRole }> {
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new ServiceError("unauthorized", "Tenés que iniciar sesión");

  const role = await resolveRole(db, user.id);
  if (!allowed.includes(role)) throw new ServiceError("forbidden", "Esta herramienta es solo para vendedores.");
  return { userId: user.id, role };
}
