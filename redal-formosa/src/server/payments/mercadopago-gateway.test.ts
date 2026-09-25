import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { PaymentsNotConfiguredError } from "./payment-gateway";
import { MercadoPagoGateway } from "./mercadopago-gateway";

const SECRET = "secreto-de-prueba";

function sign(dataId: string, requestId: string, ts: string, secret = SECRET) {
  const v1 = createHmac("sha256", secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

describe("MercadoPagoGateway.verifyWebhook", () => {
  const gateway = new MercadoPagoGateway({ accessToken: "TEST-token", webhookSecret: SECRET });

  it("acepta una firma válida", () => {
    expect(gateway.verifyWebhook({ dataId: "123", requestId: "req-1", signature: sign("123", "req-1", "1700000000") })).toBe(true);
  });

  it("rechaza si cambió el id del pago", () => {
    expect(gateway.verifyWebhook({ dataId: "999", requestId: "req-1", signature: sign("123", "req-1", "1700000000") })).toBe(false);
  });

  it("rechaza una firma hecha con otro secreto", () => {
    expect(gateway.verifyWebhook({ dataId: "123", requestId: "req-1", signature: sign("123", "req-1", "1700000000", "otro") })).toBe(false);
  });

  it("rechaza si faltan la firma o el request-id", () => {
    expect(gateway.verifyWebhook({ dataId: "123", requestId: "req-1", signature: null })).toBe(false);
    expect(gateway.verifyWebhook({ dataId: "123", requestId: null, signature: sign("123", "req-1", "1") })).toBe(false);
    expect(gateway.verifyWebhook({ dataId: "123", requestId: "req-1", signature: "basura" })).toBe(false);
  });

  it("sin secreto configurado confía en la consulta directa al proveedor", () => {
    const open = new MercadoPagoGateway({ accessToken: "TEST-token" });
    expect(open.verifyWebhook({ dataId: "123", requestId: null, signature: null })).toBe(true);
  });
});

describe("MercadoPagoGateway sin credenciales", () => {
  it("falla con un error claro al usarse, no al importarse", async () => {
    const gateway = new MercadoPagoGateway({ accessToken: undefined });
    await expect(gateway.getPayment("1")).rejects.toBeInstanceOf(PaymentsNotConfiguredError);
  });
});
