import { EventBus } from "./event-bus";

/** Hechos del ciclo de vida de un pedido que otras partes del sistema pueden escuchar. */
export interface OrderEvents {
  paid: { orderId: string };
}

export type OrderEventBus = EventBus<OrderEvents>;
