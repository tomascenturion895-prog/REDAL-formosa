type Handler<T> = (payload: T) => Promise<void> | void;

/**
 * Bus de eventos tipado (patrón Observer). Quien produce un hecho ("el pedido se pagó")
 * no conoce a quién le interesa: agregar un aviso nuevo es suscribir un handler,
 * sin tocar el código de pagos.
 */
export class EventBus<Events extends object> {
  private readonly handlers: { [K in keyof Events]?: Handler<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    (this.handlers[event] ??= []).push(handler);
    return () => {
      this.handlers[event] = this.handlers[event]?.filter((h) => h !== handler);
    };
  }

  /** Espera a todos los handlers; el fallo de uno no impide ni oculta a los demás. */
  async emit<K extends keyof Events>(event: K, payload: Events[K]): Promise<void> {
    // async envuelve también las excepciones síncronas del handler en una promesa rechazada.
    const results = await Promise.allSettled((this.handlers[event] ?? []).map(async (h) => h(payload)));
    for (const r of results) {
      if (r.status === "rejected") console.error(`Handler de "${String(event)}" falló:`, r.reason);
    }
  }
}
