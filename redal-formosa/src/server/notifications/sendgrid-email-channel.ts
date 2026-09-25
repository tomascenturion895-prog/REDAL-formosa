import type { NotificationChannel, NotificationMessage } from "./channel";

interface SendGridConfig {
  apiKey: string | undefined;
  /** Debe ser un remitente verificado en SendGrid. */
  fromEmail: string;
  fromName?: string;
}

export class SendGridEmailChannel implements NotificationChannel {
  readonly kind = "email" as const;

  constructor(private readonly config: SendGridConfig) {}

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  async send(to: string, message: NotificationMessage): Promise<void> {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], subject: message.subject ?? "RedAL Formosa" }],
        from: { email: this.config.fromEmail, name: this.config.fromName ?? "RedAL Formosa" },
        content: [
          { type: "text/plain", value: message.text },
          ...(message.html ? [{ type: "text/html", value: message.html }] : []),
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`SendGrid respondió ${response.status}: ${await response.text()}`);
  }
}
