import type { NotificationChannel, NotificationMessage } from "./channel";

interface TwilioConfig {
  accountSid: string | undefined;
  authToken: string | undefined;
  fromNumber: string | undefined;
}

export class TwilioSmsChannel implements NotificationChannel {
  readonly kind = "sms" as const;

  constructor(private readonly config: TwilioConfig) {}

  isConfigured(): boolean {
    return Boolean(this.config.accountSid && this.config.authToken && this.config.fromNumber);
  }

  async send(to: string, message: NotificationMessage): Promise<void> {
    const { accountSid, authToken, fromNumber } = this.config;
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: fromNumber ?? "", To: to, Body: message.text }).toString(),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Twilio respondió ${response.status}: ${await response.text()}`);
  }
}
