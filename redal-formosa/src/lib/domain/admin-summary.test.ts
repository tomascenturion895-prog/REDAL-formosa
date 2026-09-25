import { describe, expect, it } from "vitest";

import { activationRate, cancellationRate, parseSummary, trend } from "./admin-summary";

describe("parseSummary", () => {
  it("normaliza números y deja null la calificación ausente", () => {
    const summary = parseSummary({ productos_pendientes: "3", pedidos_7d: 12, calificacion_promedio: null, ingresos_7d: "45000.5" });
    expect(summary).toMatchObject({ productos_pendientes: 3, pedidos_7d: 12, calificacion_promedio: null, ingresos_7d: 45000.5, cancelados_30d: 0 });
  });

  it("tolera una respuesta vacía o inválida", () => {
    expect(parseSummary(null).pedidos_30d).toBe(0);
    expect(parseSummary("x").productores_activos).toBe(0);
    expect(parseSummary({ pedidos_7d: "abc" }).pedidos_7d).toBe(0);
  });
});

describe("trend", () => {
  it("calcula la variación contra la semana anterior", () => {
    expect(trend(15, 10)).toEqual({ percent: 50, direction: "up" });
    expect(trend(5, 10)).toEqual({ percent: -50, direction: "down" });
    expect(trend(10, 10)).toEqual({ percent: 0, direction: "flat" });
  });

  it("no inventa un porcentaje sin base de comparación", () => {
    expect(trend(4, 0)).toEqual({ percent: null, direction: "up" });
    expect(trend(0, 0)).toEqual({ percent: null, direction: "flat" });
  });
});

describe("tasas", () => {
  it("cancelación", () => {
    expect(cancellationRate(2, 8)).toBe(25);
    expect(cancellationRate(0, 0)).toBeNull();
  });

  it("activación de productores", () => {
    expect(activationRate(3, 5)).toBe(60);
    expect(activationRate(0, 0)).toBeNull();
    expect(activationRate(7, 5)).toBe(100);
  });
});
