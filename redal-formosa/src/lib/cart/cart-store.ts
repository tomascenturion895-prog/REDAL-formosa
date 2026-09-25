import { cartReducer, type CartAction, type CartItem } from "./cart-reducer";

// Almacén externo del carrito (localStorage) para useSyncExternalStore: sin efecto de
// hidratación, sin parpadeo y sincronizado entre pestañas.

const STORAGE_KEY = "redal.cart.v1";
const EMPTY: CartItem[] = [];

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const { producto, cantidad } = value as Partial<CartItem>;
  return (
    typeof cantidad === "number" &&
    Number.isInteger(cantidad) &&
    cantidad > 0 &&
    typeof producto === "object" &&
    producto !== null &&
    typeof producto.id === "string" &&
    typeof producto.nombre === "string" &&
    typeof producto.precio === "number" &&
    typeof producto.emprendimiento_id === "string"
  );
}

/** Convierte lo guardado en carrito. Descarta datos corruptos o con otra forma. */
export function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY;
    return items.length > 0 ? items : EMPTY;
  } catch {
    return EMPTY;
  }
}

const listeners = new Set<() => void>();
let snapshot: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY };
// Si localStorage no está disponible (modo privado) el carrito vive solo en memoria.
let memoryOnly: CartItem[] | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export const cartStore = {
  /** Devuelve la misma referencia mientras lo guardado no cambie (requisito de useSyncExternalStore). */
  getSnapshot(): CartItem[] {
    if (memoryOnly) return memoryOnly;
    const raw = readRaw();
    if (raw !== snapshot.raw) snapshot = { raw, items: parseCart(raw) };
    return snapshot.items;
  },

  getServerSnapshot: (): CartItem[] => EMPTY,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  dispatch(action: CartAction): void {
    const next = cartReducer(cartStore.getSnapshot(), action);
    try {
      if (next.length === 0) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      memoryOnly = null;
    } catch {
      memoryOnly = next;
    }
    notify();
  },
};
