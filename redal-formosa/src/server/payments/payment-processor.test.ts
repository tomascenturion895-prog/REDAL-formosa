import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "@/server/errors";
import { EventBus } from "@/server/events/event-bus";
import type { OrderEvents } from "@/server/events/order-events";
import type { PaymentGateway, PaymentInfo } from "./payment-gateway";
import { PaymentProcessor } from "./payment-processor";

type Row = Record<string, unknown>;

// Base en memoria con la parte de la API de Supabase que usa el procesador.
function fakeDb(tables: Record<string, Row[]>): Db {
  const from = (table: string) => {
    const filters: [string, unknown][] = [];
    let patch: Row | null = null;
    let returning = false;

    const matching = () => (tables[table] ?? []).filter((row) => filters.every(([col, val]) => row[col] === val));
    const run = () => {
      if (patch) {
        const rows = matching();
        rows.forEach((row) => Object.assign(row, patch));
        return { data: returning ? rows.map((r) => ({ id: r.id })) : null, error: null };
      }
      return { data: matching(), error: null };
    };

    const builder = {
      select: () => {
        returning = true;
        return builder;
      },
      update: (values: Row) => {
        patch = values;
        return builder;
      },
      eq: (col: string, val: unknown) => {
        filters.push([col, val]);
        return builder;
      },
      maybeSingle: () => Promise.resolve({ data: matching()[0] ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => Promise.resolve(run()).then(resolve, reject),
    };
    return builder;
  };
  return { from } as unknown as Db;
}

function fakeGateway(payment: Partial<PaymentInfo> = {}, authentic = true): PaymentGateway {
  return {
    createCheckout: vi.fn(),
    getPayment: vi.fn(async () => ({ id: "pay-1", orderId: "order-1", outcome: "approved" as const, amount: 3150, ...payment })),
    verifyWebhook: vi.fn(() => authentic),
  };
}

const notification = { type: "payment", dataId: "pay-1", signature: "sig", requestId: "req" };

describe("PaymentProcessor", () => {
  let tables: Record<string, Row[]>;
  let events: EventBus<OrderEvents>;
  let paidHandler: Mock<(payload: OrderEvents["paid"]) => void>;

  beforeEach(() => {
    tables = {
      pedidos: [{ id: "order-1", monto_total: 3150, estado: "pendiente_pago" }],
      pagos: [{ pedido_id: "order-1", estado: "pendiente" }],
    };
    events = new EventBus<OrderEvents>();
    paidHandler = vi.fn<(payload: OrderEvents["paid"]) => void>();
    events.on("paid", paidHandler);
  });

  const processor = (gateway: PaymentGateway) => new PaymentProcessor(gateway, fakeDb(tables), events);

  it("ignora notificaciones que no son de pago", async () => {
    const result = await processor(fakeGateway()).handle({ ...notification, type: "plan" });
    expect(result).toEqual({ status: "ignored" });
  });

  it("exige el id del pago", async () => {
    await expect(processor(fakeGateway()).handle({ ...notification, dataId: undefined })).rejects.toMatchObject({ code: "bad_request" });
  });

  it("rechaza una firma inválida sin consultar al proveedor", async () => {
    const gateway = fakeGateway({}, false);
    await expect(processor(gateway).handle(notification)).rejects.toMatchObject({ code: "unauthorized" });
    expect(gateway.getPayment).not.toHaveBeenCalled();
  });

  it("un pago aprobado por el monto completo confirma el pedido y publica el evento", async () => {
    const result = await processor(fakeGateway()).handle(notification);

    expect(result).toEqual({ status: "processed", orderId: "order-1", paid: true });
    expect(tables.pedidos[0].estado).toBe("pagado");
    expect(tables.pagos[0]).toMatchObject({ estado: "aprobado", transaccion_id: "pay-1" });
    expect(paidHandler).toHaveBeenCalledExactlyOnceWith({ orderId: "order-1" });
  });

  it("un webhook duplicado no vuelve a publicar el evento", async () => {
    const p = processor(fakeGateway());
    await p.handle(notification);
    const second = await p.handle(notification);

    expect(second).toMatchObject({ status: "processed", paid: false });
    expect(paidHandler).toHaveBeenCalledTimes(1);
  });

  it("un pago aprobado por menos del total NO confirma el pedido", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await processor(fakeGateway({ amount: 1 })).handle(notification);

    expect(result).toMatchObject({ paid: false });
    expect(tables.pedidos[0].estado).toBe("pendiente_pago");
    expect(tables.pagos[0].estado).toBe("fallido");
    expect(paidHandler).not.toHaveBeenCalled();
  });

  it("un pago rechazado queda como fallido y deja el pedido pendiente", async () => {
    const result = await processor(fakeGateway({ outcome: "failed" })).handle(notification);

    expect(result).toMatchObject({ paid: false });
    expect(tables.pagos[0].estado).toBe("fallido");
    expect(tables.pedidos[0].estado).toBe("pendiente_pago");
  });

  it("un pago pendiente no confirma nada", async () => {
    await processor(fakeGateway({ outcome: "pending" })).handle(notification);
    expect(tables.pagos[0].estado).toBe("pendiente");
    expect(paidHandler).not.toHaveBeenCalled();
  });

  it("falla si el pago apunta a un pedido inexistente", async () => {
    const error = await processor(fakeGateway({ orderId: "otro" })).handle(notification).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect(error).toMatchObject({ code: "not_found" });
  });

  it("falla si el pago no referencia un pedido", async () => {
    await expect(processor(fakeGateway({ orderId: null })).handle(notification)).rejects.toMatchObject({ code: "bad_request" });
  });
});
