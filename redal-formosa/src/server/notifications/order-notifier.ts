import { DEFAULT_PREFERENCES } from "@/lib/domain/notification-preferences";
import type { Db } from "@/lib/supabase/types";
import type { NotificationChannel, NotificationMessage } from "./channel";
import { orderPaidEmail, orderPaidSms, type OrderPaidData } from "./templates";

/**
 * Avisa a la persona compradora según sus preferencias. Depende de canales abstractos
 * (NotificationChannel) y de la base, ambos inyectados: no sabe de SendGrid ni de Twilio.
 */
export class OrderNotifier {
  constructor(
    private readonly db: Db,
    private readonly email: NotificationChannel,
    private readonly sms: NotificationChannel,
  ) {}

  async notifyPaid(orderId: string): Promise<void> {
    const { data: order } = await this.db
      .from("pedidos")
      .select("numero_pedido, monto_total, direccion_entrega, comprador_id")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return;

    const userId = order.comprador_id;
    const [{ data: profile }, { data: prefs }, { data: auth }] = await Promise.all([
      this.db.from("profiles").select("full_name, phone").eq("id", userId).maybeSingle(),
      this.db.from("preferencias_notificaciones").select("*").eq("usuario_id", userId).maybeSingle(),
      this.db.auth.admin.getUserById(userId),
    ]);

    const wantsEmail = prefs?.email_confirmacion ?? DEFAULT_PREFERENCES.email_confirmacion;
    const wantsSms = prefs?.sms_confirmacion ?? DEFAULT_PREFERENCES.sms_confirmacion;

    const data: OrderPaidData = {
      buyerName: profile?.full_name ?? "",
      orderNumber: order.numero_pedido,
      total: Number(order.monto_total),
      address: order.direccion_entrega ?? "",
    };

    const email = auth.user?.email;
    const phone = profile?.phone;

    await Promise.all([
      wantsEmail && email ? this.deliver(this.email, userId, email, orderPaidEmail(data)) : null,
      wantsSms && phone ? this.deliver(this.sms, userId, phone, orderPaidSms(data)) : null,
    ]);
  }

  /** Envía y deja constancia en la tabla de auditoría, tanto si funcionó como si falló. */
  private async deliver(channel: NotificationChannel, userId: string, to: string, message: NotificationMessage) {
    if (!channel.isConfigured()) return;

    let error: string | null = null;
    try {
      await channel.send(to, message);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      console.error(`Falló el envío por ${channel.kind}:`, error);
    }

    await this.db.from("notificaciones").insert({
      usuario_id: userId,
      tipo: channel.kind,
      asunto: message.subject ?? null,
      cuerpo: message.text,
      destinatario: to,
      estado: error ? "fallido" : "enviado",
      ultimo_error: error,
      enviado_en: error ? null : new Date().toISOString(),
    });
  }
}
