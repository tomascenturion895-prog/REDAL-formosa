import { describe, expect, it, vi } from "vitest";

import type { Db } from "@/lib/supabase/types";
import type { PaymentGateway } from "./payment-gateway";
import { CheckoutService } from "./checkout-service";

type Row = Record<string, unknown>;

// Base en memoria: solo lo que usa el servicio (select → eq → maybeSingle / await).
function fakeDb(tables: Record<string, Row[]>): Db {
  const from = (table: string) => {
    const filters: [string, unknown][] = [];
    const rows = () => (tables[table] ?? []).filter((r) => filters.every(([c, v]) => r[c] === v));
    const builder = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        filters.push([col, val]);
        return builder;
      },
      maybeSingle: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data: rows(), error: null }).then(resolve),
    };
    return builder;
  };
  return { from } as unknown as Db;
}

function fakeGateway(): PaymentGateway {
  return {
    createCheckout: vi.fn(async () => ({ url: "https://mp.test/checkout" })),
    getPayment: vi.fn(),
    verifyWebhook: vi.fn(),
    refund: vi.fn(),
  };
}

const tablesFor = (order: Row = {}) => ({
  pedidos: [{ id: "o1", comprador_id: "u1", estado: "pendiente_pago", monto_envio: 500, ...order }],
  pedido_items: [
    { pedido_id: "o1", producto_id: "p1", cantidad: 2, precio_unitario: "1000", producto: { nombre: "Miel" } },
    { pedido_id: "o1", producto_id: "p2", cantidad: 1, precio_unitario: 250, producto: null },
  ],
});

describe("CheckoutService", () => {
  it("cobra lo que dice la base (ítems y envío), no lo que mande el navegador", async () => {
    const gateway = fakeGateway();
    const service = new CheckoutService(gateway, { appUrl: "https://redal.test" });

    const session = await service.createSession(fakeDb(tablesFor()), "u1", "o1");

    expect(session.url).toBe("https://mp.test/checkout");
    expect(gateway.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "o1",
        items: [
          { id: "p1", title: "Miel", quantity: 2, unitPrice: 1000 },
          { id: "p2", title: "Producto", quantity: 1, unitPrice: 250 },
          { id: "envio", title: "Envío", quantity: 1, unitPrice: 500 },
        ],
        autoReturn: true,
        notificationUrl: "https://redal.test/api/webhooks/mercadopago",
      }),
    );
  });

  it("no agrega envío si es cero", async () => {
    const gateway = fakeGateway();
    await new CheckoutService(gateway, { appUrl: "https://redal.test" }).createSession(fakeDb(tablesFor({ monto_envio: 0 })), "u1", "o1");
    const { items } = vi.mocked(gateway.createCheckout).mock.calls[0][0];
    expect(items.some((i) => i.id === "envio")).toBe(false);
  });

  it("sin https no pide retorno automático ni webhook", async () => {
    const gateway = fakeGateway();
    await new CheckoutService(gateway, { appUrl: "http://localhost:3000" }).createSession(fakeDb(tablesFor()), "u1", "o1");
    expect(gateway.createCheckout).toHaveBeenCalledWith(expect.objectContaining({ autoReturn: false, notificationUrl: undefined }));
  });

  it("no deja pagar el pedido de otra persona", async () => {
    const service = new CheckoutService(fakeGateway(), { appUrl: "https://redal.test" });
    await expect(service.createSession(fakeDb(tablesFor()), "otro", "o1")).rejects.toMatchObject({ code: "not_found" });
  });

  it("rechaza un pedido que ya no está pendiente de pago", async () => {
    const service = new CheckoutService(fakeGateway(), { appUrl: "https://redal.test" });
    await expect(service.createSession(fakeDb(tablesFor({ estado: "pagado" })), "u1", "o1")).rejects.toMatchObject({ code: "conflict" });
  });

  it("rechaza un pedido sin productos", async () => {
    const service = new CheckoutService(fakeGateway(), { appUrl: "https://redal.test" });
    const tables = { ...tablesFor(), pedido_items: [] };
    await expect(service.createSession(fakeDb(tables), "u1", "o1")).rejects.toMatchObject({ code: "conflict" });
  });
});
