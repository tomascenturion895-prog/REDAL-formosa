import { createAdminClient } from "@/lib/supabase/admin";
import { OpenAiProductExtractor } from "./ai/openai-product-extractor";
import { OpenAiWhisper } from "./ai/openai-whisper";
import { VoiceCatalogService } from "./ai/voice-catalog-service";
import { NominatimGeocoder } from "./geo/geocoder";
import { EventBus } from "./events/event-bus";
import type { OrderEvents } from "./events/order-events";
import { OrderNotifier } from "./notifications/order-notifier";
import { SendGridEmailChannel } from "./notifications/sendgrid-email-channel";
import { TwilioSmsChannel } from "./notifications/twilio-sms-channel";
import { CheckoutService } from "./payments/checkout-service";
import { MercadoPagoGateway } from "./payments/mercadopago-gateway";
import { PaymentProcessor } from "./payments/payment-processor";
import { BankAccountService } from "./producer/bank-account-service";
import { ServiceError } from "./errors";
import { InMemoryRateLimiter } from "./security/rate-limiter";
import { AesGcmCipher } from "./security/secret-cipher";

// Raíz de composición: el único lugar que conoce las implementaciones concretas y las
// conecta. El resto del servidor depende de interfaces. Se crean al primer uso para que
// el build (sin variables de entorno) no falle.

const paymentGateway = lazy(
  () =>
    new MercadoPagoGateway({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    }),
);

export const getCheckoutService = lazy(
  () => new CheckoutService(paymentGateway(), { appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "") }),
);

export const getPaymentProcessor = lazy(() => {
  const db = createAdminClient();
  const events = new EventBus<OrderEvents>();

  const notifier = new OrderNotifier(
    db,
    new SendGridEmailChannel({
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.NOTIFICATIONS_FROM_EMAIL ?? "noreply@redal.com",
    }),
    new TwilioSmsChannel({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
    }),
  );
  events.on("paid", ({ orderId }) => notifier.notifyPaid(orderId));

  return new PaymentProcessor(paymentGateway(), db, events);
});

export const getBankAccountService = lazy(() => {
  // Rotación: BANK_ENCRYPTION_KEYRING = {"currentId":"v2","keys":{"v1":"...","v2":"..."}}.
  // Sin anillo, BANK_ENCRYPTION_KEY es la única clave (id "v1").
  const keyring = process.env.BANK_ENCRYPTION_KEYRING;
  const single = process.env.BANK_ENCRYPTION_KEY;
  if (!keyring && !single) {
    throw new ServiceError("unavailable", "El guardado de datos bancarios todavía no está habilitado.");
  }
  const cipher = new AesGcmCipher(keyring ? JSON.parse(keyring) : { currentId: "v1", keys: { v1: single! } });
  return new BankAccountService(createAdminClient(), cipher);
});

export const getVoiceCatalogService = lazy(
  () =>
    new VoiceCatalogService(
      new OpenAiWhisper(process.env.OPENAI_API_KEY),
      new OpenAiProductExtractor(process.env.OPENAI_API_KEY),
    ),
);

export const getGeocoder = lazy(
  () =>
    new NominatimGeocoder({
      userAgent: `RedALFormosa/1.0 (${process.env.NEXT_PUBLIC_APP_URL || "https://redal-formosa.local"})`,
    }),
);

// Límites por clave (usuario o IP). Frenan abusos sin molestar el uso normal.
export const limiters = {
  checkout: new InMemoryRateLimiter({ limit: 10, windowMs: 60_000 }),
  bankAccount: new InMemoryRateLimiter({ limit: 5, windowMs: 60_000 }),
  voiceCatalog: new InMemoryRateLimiter({ limit: 10, windowMs: 60_000 }),
  geocode: new InMemoryRateLimiter({ limit: 15, windowMs: 60_000 }),
  // Nominatim pide como máximo ~1 pedido por segundo en total, sin importar quién lo haga.
  geocodeGlobal: new InMemoryRateLimiter({ limit: 50, windowMs: 60_000 }),
  webhook: new InMemoryRateLimiter({ limit: 300, windowMs: 60_000 }),
};

function lazy<T>(create: () => T): () => T {
  let instance: T | undefined;
  return () => (instance ??= create());
}
