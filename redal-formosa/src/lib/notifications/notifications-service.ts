import { createClient } from "@/lib/supabase/client";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendSMSOptions {
  to: string;
  body: string;
}

export interface NotificationLog {
  usuario_id: string;
  tipo: "email" | "sms" | "push";
  asunto?: string;
  cuerpo: string;
  destinatario: string;
  estado?: "pendiente" | "enviado" | "fallido";
}

export class NotificationsService {
  private supabase = createClient();
  private sendgridApiKey = process.env.SENDGRID_API_KEY || "";
  private twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || "";
  private twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "";
  private twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

  /**
   * Enviar email
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      if (!this.sendgridApiKey) {
        console.warn("SENDGRID_API_KEY no configurado");
        return false;
      }

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject,
            },
          ],
          from: {
            email: options.from || "noreply@redal.com",
            name: "RedAL Formosa",
          },
          content: [
            {
              type: "text/html",
              value: options.html,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error("Error sending email:", await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in sendEmail:", error);
      return false;
    }
  }

  /**
   * Enviar SMS
   */
  async sendSMS(options: SendSMSOptions): Promise<boolean> {
    try {
      if (!this.twilioAccountSid || !this.twilioAuthToken) {
        console.warn("Twilio credentials no configurados");
        return false;
      }

      const auth = Buffer.from(
        `${this.twilioAccountSid}:${this.twilioAuthToken}`
      ).toString("base64");

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: this.twilioPhoneNumber,
            To: options.to,
            Body: options.body,
          }).toString(),
        }
      );

      if (!response.ok) {
        console.error("Error sending SMS:", await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in sendSMS:", error);
      return false;
    }
  }

  /**
   * Registrar notificación en BD
   */
  async logNotification(data: NotificationLog): Promise<boolean> {
    try {
      const { error } = await (this.supabase
        .from("notificaciones")
        .insert({
          usuario_id: data.usuario_id,
          tipo: data.tipo,
          asunto: data.asunto,
          cuerpo: data.cuerpo,
          destinatario: data.destinatario,
          estado: data.estado || "pendiente",
        } as any) as any);

      if (error) {
        console.error("Error logging notification:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in logNotification:", error);
      return false;
    }
  }

  /**
   * Obtener preferencias de notificación del usuario
   */
  async getPreferences(userId: string): Promise<any | null> {
    try {
      const { data, error } = await (this.supabase
        .from("preferencias_notificaciones")
        .select("*")
        .eq("usuario_id", userId)
        .single() as any);

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    } catch (error) {
      console.error("Error getting preferences:", error);
      return null;
    }
  }

  /**
   * Actualizar preferencias
   */
  async updatePreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      const { error } = await ((this.supabase as any)
        .from("preferencias_notificaciones")
        .update(preferences)
        .eq("usuario_id", userId));

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating preferences:", error);
      return false;
    }
  }

  /**
   * Obtener historial de notificaciones
   */
  async getHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", userId)
        .order("creado_en", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  }
}

export const notificationsService = new NotificationsService();
