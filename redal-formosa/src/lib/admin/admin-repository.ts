import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap } from "@/lib/supabase/repository";
import type { Enums } from "@/lib/supabase/database.types";
import type { UserRole } from "@/lib/supabase/types";
import { parseSummary, type AdminSummary } from "@/lib/domain/admin-summary";

export type { AdminSummary };

export interface PendingVerification {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  emprendimiento_nombre: string | null;
  dni_frente_url: string;
  dni_reverso_url: string;
  selfie_url: string;
  created_at: string;
}

export interface AdminStats {
  total_usuarios: number;
  total_productos: number;
  total_pedidos: number;
  total_calificaciones: number;
  ingresos_totales: number;
  pedidos_completados: number;
  pedidos_en_entrega: number;
}

export interface PendingProduct {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  unidad: string;
  imagen_url: string | null;
  created_at: string;
  emprendimiento_nombre: string;
  productor_email: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  cantidad_pedidos: number;
}

export type VehicleType = Enums<"vehicle_type">;

export interface AdminCourier {
  id: string;
  email: string;
  full_name: string | null;
  tipo_vehiculo: VehicleType;
  activo: boolean;
  entregas_activas: number;
  viajes_completados: number;
}

export interface PendingPayout {
  emprendimiento_id: string;
  emprendimiento_nombre: string;
  owner_id: string;
  cantidad_pedidos: number;
  monto_bruto: number;
  comision_pct: number;
  comision: number;
  monto_neto: number;
}

/**
 * Acceso a las funciones administrativas. La autorización real vive en la base
 * (cada función verifica is_admin()); esto solo tipa y normaliza las respuestas.
 */
export class AdminRepository {
  constructor(private readonly db: Db = createClient()) {}

  async stats(): Promise<AdminStats> {
    const rows = await unwrap(this.db.rpc("admin_get_stats"), "cargar métricas");
    const row = rows[0];
    if (!row) throw new RepositoryError("cargar métricas: sin datos");
    return {
      total_usuarios: Number(row.total_usuarios),
      total_productos: Number(row.total_productos),
      total_pedidos: Number(row.total_pedidos),
      total_calificaciones: Number(row.total_calificaciones),
      ingresos_totales: Number(row.ingresos_totales),
      pedidos_completados: Number(row.pedidos_completados),
      pedidos_en_entrega: Number(row.pedidos_en_entrega),
    };
  }

  async pendingProducts(): Promise<PendingProduct[]> {
    const rows = await unwrap(this.db.rpc("admin_pending_products"), "listar productos pendientes");
    return rows.map((r) => ({
      ...r,
      descripcion: r.descripcion ?? null,
      imagen_url: r.imagen_url ?? null,
      productor_email: r.productor_email ?? null,
      precio: Number(r.precio),
    }));
  }

  async users(): Promise<AdminUser[]> {
    const rows = await unwrap(this.db.rpc("admin_list_users"), "listar usuarios");
    return rows.map((r) => ({ ...r, full_name: r.full_name ?? null, cantidad_pedidos: Number(r.cantidad_pedidos) }));
  }

  async approveProduct(productId: string): Promise<void> {
    const { error } = await this.db.rpc("admin_review_product", { product_id: productId, approve: true });
    if (error) throw new RepositoryError(`aprobar producto: ${error.message}`, error);
  }

  async rejectProduct(productId: string, reason: string): Promise<void> {
    const { error } = await this.db.rpc("admin_review_product", { product_id: productId, approve: false, reason });
    if (error) throw new RepositoryError(`rechazar producto: ${error.message}`, error);
  }

  async summary(): Promise<AdminSummary> {
    return parseSummary(await unwrap(this.db.rpc("admin_resumen"), "cargar el resumen"));
  }

  async pendingVerifications(): Promise<PendingVerification[]> {
    const rows = await unwrap(this.db.rpc("admin_pending_verifications"), "listar verificaciones pendientes");
    return rows.map((r) => ({ ...r, full_name: r.full_name ?? null, email: r.email ?? null, emprendimiento_nombre: r.emprendimiento_nombre ?? null }));
  }

  /** Enlace temporal (5 minutos) a un documento del bucket privado; solo un administrador puede generarlo. */
  async documentUrl(path: string): Promise<string> {
    const { data, error } = await this.db.storage.from("biometric-verification").createSignedUrl(path, 300);
    if (error || !data) throw new RepositoryError(`abrir documento: ${error?.message ?? "sin enlace"}`, error ?? undefined);
    return data.signedUrl;
  }

  async reviewVerification(id: string, approve: boolean, reason?: string): Promise<void> {
    const { error } = await this.db.rpc("admin_review_verification", { p_id: id, p_approve: approve, p_reason: reason });
    if (error) throw new RepositoryError(`revisar verificación: ${error.message}`, error);
  }

  async pendingPayouts(): Promise<PendingPayout[]> {
    const rows = await unwrap(this.db.rpc("admin_liquidaciones_pendientes"), "listar liquidaciones pendientes");
    return rows.map((r) => ({
      ...r,
      cantidad_pedidos: Number(r.cantidad_pedidos),
      monto_bruto: Number(r.monto_bruto),
      comision_pct: Number(r.comision_pct),
      comision: Number(r.comision),
      monto_neto: Number(r.monto_neto),
    }));
  }

  /** Registra que se transfirió lo pendiente del emprendimiento; `reference` es el número de operación. */
  async settlePayout(emprendimientoId: string, reference: string): Promise<void> {
    const { error } = await this.db.rpc("admin_liquidar", { p_emprendimiento: emprendimientoId, p_referencia: reference });
    if (error) throw new RepositoryError(`registrar liquidación: ${error.message}`, error);
  }

  async commission(): Promise<number> {
    return Number(await unwrap(this.db.rpc("admin_comision"), "cargar comisión"));
  }

  async setCommission(pct: number): Promise<void> {
    const { error } = await this.db.rpc("admin_set_comision", { p_pct: pct });
    if (error) throw new RepositoryError(`guardar comisión: ${error.message}`, error);
  }

  async couriers(): Promise<AdminCourier[]> {
    const rows = await unwrap(this.db.rpc("admin_repartidores"), "listar repartidores");
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      full_name: r.full_name ?? null,
      tipo_vehiculo: r.tipo_vehiculo,
      activo: r.activo,
      entregas_activas: Number(r.entregas_activas),
      viajes_completados: Number(r.viajes_completados),
    }));
  }

  /** Da de alta (o reactiva) como repartidor a una cuenta ya registrada. El mensaje de la base explica si no existe. */
  async addCourier(email: string, vehicle: VehicleType): Promise<void> {
    const { error } = await this.db.rpc("admin_alta_repartidor", { p_email: email, p_vehiculo: vehicle });
    if (error) throw new RepositoryError(error.message, error);
  }

  async deactivateCourier(id: string): Promise<void> {
    const { error } = await this.db.rpc("admin_baja_repartidor", { p_id: id });
    if (error) throw new RepositoryError(`dar de baja al repartidor: ${error.message}`, error);
  }

  async setRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await this.db.rpc("admin_set_role", { target_user: userId, new_role: role });
    if (error) throw new RepositoryError(`cambiar rol: ${error.message}`, error);
  }
}

export const adminRepository = new AdminRepository();
