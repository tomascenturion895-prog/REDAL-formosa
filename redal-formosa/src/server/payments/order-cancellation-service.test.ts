import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Db } from "@/lib/supabase/types";
import type { PaymentGateway, PaymentInfo } from "./payment-gateway";
import { OrderCancellationService } from "./order-cancellation-service";

type Row = Record<string, unknown>;

// Base en memoria con la parte de la API de Supabase que usa el servicio.
function fakeDb(tables: Record<string, Row[]>): Db {
  const from = (table: string) => {
    const filters: [string, (v: unknown) => boolean][] = [];
    let patch: Row | null = null;
    let returning = false;
    const matching = () => (tables[table] ?? []).filter((row) => filters.every(([col, test]) => test(row[col])));
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
        filters.push([col, (v) => v === val]);
        return builder;
      },
      in: (col: string, vals: unknown[]) => {
        filters.push([col, (v) => vals.includes(v)]);
        return builder;
      },
      maybeSingle: () => Promise.resolve({ data: matching()[0] ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => {
        const rows = matching();
        if (patch) rows.forEach((row) => Object.assign(row, patch));
        return Promise.resolve({ data: patch && !returning ? null : rows.map((r) => ({ id: r.id })), error: null }).then(resolve, reject);
      },
    };
    return builder;
  };
  return { from } as unknown as Db;
}

const gatewayWith = (payment: Partial<PaymentInfo> = {}): PaymentGateway => ({
  createCheckout: vi.fn(),
  getPayment: vi.fn(async () => ({ id: "pay-1", orderId: "o1", outcome: "approved" as const, amount: 100, ...payment })),
  verifyWebhook: vi.fn(() => true),
  refund: vi.fn(async () => {}),
});

describe("OrderCancellationService", () => {
  let tables: Record<string, Row[]>;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    tables = {
      pedidos: [{ id: "o1", estado: "pagado", emprendimiento: { owner_id: "seller" } }],
      pagos: [{ pedido_id: "o1", estado: "aprobado", transaccion_id: "pay-1" }],
    };
  });

  const run = (gateway: PaymentGateway, sellerId = "seller") =>
    new OrderCancellationService(gateway, fakeDb(tables)).cancelPaidOrder(fakeDb(tables), sellerId, "o1");

  it("devuelve el dinero y cancela el pedido", async () => {
    const gateway = gatewayWith();
    await run(gateway);

    expect(gateway.refund).toHaveBeenCalledExactlyOnceWith("pay-1");
    expect(tables.pedidos[0].estado).toBe("cancelado");
    expect(tables.pagos[0].estado).toBe("reembolsado");
  });

  it("no toca pedidos de otro vendedor", async () => {
    const gateway = gatewayWith();
    await expect(run(gateway, "otro")).rejects.toMatchObject({ code: "not_found" });
    expect(gateway.refund).not.toHaveBeenCalled();
    expect(tables.pedidos[0].estado).toBe("pagado");
  });

  it.each(["en_camino", "entregado", "pendiente_pago"])("no cancela un pedido %s", async (estado) => {
    tables.pedidos[0].estado = estado;
    const gateway = gatewayWith();
    await expect(run(gateway)).rejects.toMatchObject({ code: "conflict" });
    expect(gateway.refund).not.toHaveBeenCalled();
  });

  it("si la devolución falla, el pedido queda igual y se puede reintentar", async () => {
    const gateway = gatewayWith();
    vi.mocked(gateway.refund).mockRejectedValueOnce(new Error("MP caído"));

    await expect(run(gateway)).rejects.toMatchObject({ code: "unavailable" });
    expect(tables.pedidos[0].estado).toBe("pagado");
    expect(tables.pagos[0].estado).toBe("aprobado");

    await run(gateway);
    expect(tables.pedidos[0].estado).toBe("cancelado");
  });

  it("si el pago ya figuraba reembolsado en el proveedor, no lo devuelve otra vez", async () => {
    const gateway = gatewayWith({ outcome: "refunded" });
    await run(gateway);

    expect(gateway.refund).not.toHaveBeenCalled();
    expect(tables.pedidos[0].estado).toBe("cancelado");
  });

  it("sin un pago aprobado registrado no hay nada que devolver", async () => {
    tables.pagos[0].estado = "pendiente";
    const gateway = gatewayWith();
    await expect(run(gateway)).rejects.toMatchObject({ code: "conflict" });
    expect(gateway.refund).not.toHaveBeenCalled();
  });

  it("cancelar dos veces es inocuo", async () => {
    tables.pedidos[0].estado = "cancelado";
    const gateway = gatewayWith();
    await run(gateway);
    expect(gateway.refund).not.toHaveBeenCalled();
  });
});
