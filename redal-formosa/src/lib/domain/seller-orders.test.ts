import { describe, expect, it } from "vitest";

import { buyerMessage, extractBuyerPhone, groupOrders, NEXT_STEP, timeAgo, type SellerOrder } from "./seller-orders";

const order = (over: Partial<SellerOrder>): SellerOrder => ({
  id: "1",
  numero_pedido: "RED-0001",
  estado: "pagado",
  monto_total: 5000,
  monto_envio: 150,
  direccion_entrega: "Belgrano 100",
  nota_cliente: null,
  creado_en: "2026-09-25T10:00:00Z",
  comprador_nombre: "Lucía Fernández",
  emprendimiento_id: "e1",
  emprendimiento_nombre: "Chacra El Sol",
  items: [],
  ...over,
});

describe("groupOrders", () => {
  it("reparte por etapa y descarta lo que no es del vendedor", () => {
    const groups = groupOrders([
      order({ id: "a", estado: "pagado" }),
      order({ id: "b", estado: "en_preparacion" }),
      order({ id: "c", estado: "listo" }),
      order({ id: "d", estado: "en_camino" }),
      order({ id: "e", estado: "entregado" }),
      order({ id: "f", estado: "cancelado" }),
      order({ id: "g", estado: "pendiente_pago" }),
    ]);
    expect(groups.por_preparar.map((o) => o.id)).toEqual(["a"]);
    expect(groups.en_preparacion.map((o) => o.id)).toEqual(["b"]);
    expect(groups.listos.map((o) => o.id)).toEqual(["c", "d"]);
    expect(groups.cerrados.map((o) => o.id).sort()).toEqual(["e", "f"]);
  });

  it("los que esperan hace más van primero, y los cerrados al revés", () => {
    const groups = groupOrders([
      order({ id: "nuevo", creado_en: "2026-09-25T12:00:00Z" }),
      order({ id: "viejo", creado_en: "2026-09-25T08:00:00Z" }),
      order({ id: "c1", estado: "entregado", creado_en: "2026-09-20T08:00:00Z" }),
      order({ id: "c2", estado: "entregado", creado_en: "2026-09-24T08:00:00Z" }),
    ]);
    expect(groups.por_preparar.map((o) => o.id)).toEqual(["viejo", "nuevo"]);
    expect(groups.cerrados.map((o) => o.id)).toEqual(["c2", "c1"]);
  });
});

describe("NEXT_STEP", () => {
  it("solo permite empezar a preparar y marcar listo", () => {
    expect(NEXT_STEP.pagado?.estado).toBe("en_preparacion");
    expect(NEXT_STEP.en_preparacion?.estado).toBe("listo");
    expect(NEXT_STEP.listo).toBeUndefined();
    expect(NEXT_STEP.entregado).toBeUndefined();
  });
});

describe("extractBuyerPhone", () => {
  it("toma el teléfono de la nota del checkout", () => {
    expect(extractBuyerPhone("Tel: 3704 123456 · tocar timbre")).toBe("3704 123456");
    expect(extractBuyerPhone("Tel: +54 9 3704 123456")).toBe("+54 9 3704 123456");
  });

  it("devuelve null si no hay teléfono", () => {
    expect(extractBuyerPhone(null)).toBeNull();
    expect(extractBuyerPhone("Dejar en la puerta")).toBeNull();
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  it.each([
    ["2026-09-25T11:59:40Z", "recién"],
    ["2026-09-25T11:45:00Z", "hace 15 min"],
    ["2026-09-25T09:00:00Z", "hace 3 h"],
    ["2026-09-24T11:00:00Z", "hace 1 día"],
    ["2026-09-22T11:00:00Z", "hace 3 días"],
  ])("%s -> %s", (iso, expected) => expect(timeAgo(iso, now)).toBe(expected));
});

describe("buyerMessage", () => {
  it("nombra al comprador, al emprendimiento y la etapa", () => {
    const text = buyerMessage(order({ estado: "listo" }));
    expect(text).toContain("Hola Lucía");
    expect(text).toContain("Chacra El Sol");
    expect(text).toContain("RED-0001");
    expect(text).toContain("ya está listo");
  });
});
