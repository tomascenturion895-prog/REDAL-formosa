import { createClient } from "@/lib/supabase/client";

export interface AdminStats {
  total_usuarios: number;
  total_productos: number;
  total_pedidos: number;
  total_calificaciones: number;
  ingresos_totales: number;
  pedidos_completados: number;
  pedidos_en_entrega: number;
}

export class AdminService {
  private supabase = createClient();

  /**
   * Verificar si usuario es admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await (this.supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single() as any);

      if (error) return false;
      return (data as any)?.is_admin || false;
    } catch {
      return false;
    }
  }

  /**
   * Obtener estadísticas del dashboard
   */
  async getStats(): Promise<AdminStats | null> {
    try {
      const { data, error } = await (this.supabase
        .from("admin_stats")
        .select("*")
        .single() as any);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting stats:", error);
      return null;
    }
  }

  /**
   * Obtener productos pendientes de validación
   */
  async getPendingProducts(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await (this.supabase
        .from("productos_pendientes_validacion")
        .select("*")
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting pending products:", error);
      return [];
    }
  }

  /**
   * Obtener usuarios para moderación
   */
  async getUsers(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await (this.supabase
        .from("usuarios_moderacion")
        .select("*")
        .limit(limit) as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  /**
   * Validar producto
   */
  async approveProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("productos")
        .update({ validado: true })
        .eq("id", productId));

      if (error) throw error;

      // Log de auditoría
      await this.logAction("APROBAR_PRODUCTO", "producto", productId);
      return true;
    } catch (error) {
      console.error("Error approving product:", error);
      return false;
    }
  }

  /**
   * Rechazar producto
   */
  async rejectProduct(productId: string, razon: string): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("productos")
        .update({ validado: false, razon_rechazo: razon })
        .eq("id", productId));

      if (error) throw error;

      await this.logAction("RECHAZAR_PRODUCTO", "producto", productId);
      return true;
    } catch (error) {
      console.error("Error rejecting product:", error);
      return false;
    }
  }

  /**
   * Deshabilitar usuario
   */
  async disableUser(userId: string, razon: string): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("profiles")
        .update({ disabled: true, disabled_razon: razon })
        .eq("id", userId));

      if (error) throw error;

      await this.logAction("DESHABILITAR_USUARIO", "usuario", userId);
      return true;
    } catch (error) {
      console.error("Error disabling user:", error);
      return false;
    }
  }

  /**
   * Promover a admin
   */
  async promoteToAdmin(userId: string): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", userId));

      if (error) throw error;

      await this.logAction("PROMOVER_ADMIN", "usuario", userId);
      return true;
    } catch (error) {
      console.error("Error promoting to admin:", error);
      return false;
    }
  }

  /**
   * Remover admin
   */
  async removeAdmin(userId: string): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("profiles")
        .update({ is_admin: false })
        .eq("id", userId));

      if (error) throw error;

      await this.logAction("REMOVER_ADMIN", "usuario", userId);
      return true;
    } catch (error) {
      console.error("Error removing admin:", error);
      return false;
    }
  }

  /**
   * Obtener historial de auditoría
   */
  async getAuditLog(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("admin_audit_log")
        .select("*")
        .order("creado_en", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting audit log:", error);
      return [];
    }
  }

  /**
   * Registrar acción en auditoría
   */
  private async logAction(
    accion: string,
    entidad: string,
    entidadId?: string
  ): Promise<void> {
    try {
      const { error } = await ((this.supabase as any)
        .from("admin_audit_log")
        .insert({
          accion,
          entidad,
          entidad_id: entidadId,
        }));

      if (error) console.error("Error logging action:", error);
    } catch (error) {
      console.error("Error in logAction:", error);
    }
  }
}

export const adminService = new AdminService();
