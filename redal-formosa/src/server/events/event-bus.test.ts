import { afterEach, describe, expect, it, vi } from "vitest";

import { EventBus } from "./event-bus";

interface Events {
  paid: { orderId: string };
}

afterEach(() => vi.restoreAllMocks());

describe("EventBus", () => {
  it("entrega el evento a todos los suscriptores", async () => {
    const bus = new EventBus<Events>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on("paid", a);
    bus.on("paid", b);

    await bus.emit("paid", { orderId: "o1" });

    expect(a).toHaveBeenCalledWith({ orderId: "o1" });
    expect(b).toHaveBeenCalledWith({ orderId: "o1" });
  });

  it("el fallo de un suscriptor no impide que corran los demás", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const bus = new EventBus<Events>();
    const ok = vi.fn();
    bus.on("paid", () => {
      throw new Error("falló el email");
    });
    bus.on("paid", ok);

    await expect(bus.emit("paid", { orderId: "o1" })).resolves.toBeUndefined();
    expect(ok).toHaveBeenCalled();
  });

  it("permite cancelar la suscripción", async () => {
    const bus = new EventBus<Events>();
    const handler = vi.fn();
    const off = bus.on("paid", handler);
    off();

    await bus.emit("paid", { orderId: "o1" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("emitir sin suscriptores no falla", async () => {
    await expect(new EventBus<Events>().emit("paid", { orderId: "o1" })).resolves.toBeUndefined();
  });
});
