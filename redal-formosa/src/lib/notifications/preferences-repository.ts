import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrapOptional } from "@/lib/supabase/repository";
import { DEFAULT_PREFERENCES, type NotificationPreferences } from "@/lib/domain/notification-preferences";

export type { NotificationPreferences };

export class PreferencesRepository {
  constructor(private readonly db: Db = createClient()) {}

  /** Si la persona nunca las guardó, devuelve los valores por defecto. */
  async get(userId: string): Promise<NotificationPreferences> {
    const row = await unwrapOptional(
      this.db
        .from("preferencias_notificaciones")
        .select("email_confirmacion, email_estado_pedido, email_ofertas, sms_confirmacion, sms_estado_pedido")
        .eq("usuario_id", userId)
        .maybeSingle(),
      "cargar preferencias",
    );
    return {
      email_confirmacion: row?.email_confirmacion ?? DEFAULT_PREFERENCES.email_confirmacion,
      email_estado_pedido: row?.email_estado_pedido ?? DEFAULT_PREFERENCES.email_estado_pedido,
      email_ofertas: row?.email_ofertas ?? DEFAULT_PREFERENCES.email_ofertas,
      sms_confirmacion: row?.sms_confirmacion ?? DEFAULT_PREFERENCES.sms_confirmacion,
      sms_estado_pedido: row?.sms_estado_pedido ?? DEFAULT_PREFERENCES.sms_estado_pedido,
    };
  }

  /** upsert: las cuentas anteriores al trigger de alta no tienen fila de preferencias. */
  async save(userId: string, prefs: NotificationPreferences): Promise<void> {
    const { error } = await this.db
      .from("preferencias_notificaciones")
      .upsert({ ...prefs, usuario_id: userId }, { onConflict: "usuario_id" });
    if (error) throw new RepositoryError(`guardar preferencias: ${error.message}`, error);
  }
}

export const preferencesRepository = new PreferencesRepository();
