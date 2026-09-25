import { cartReducer, mergeCarts, type CartAction, type CartItem } from "./cart-reducer";

// Almacén externo del carrito (localStorage) para useSyncExternalStore: sin efecto de
// hidratación, sin parpadeo y sincronizado entre pestañas.
//
// Cada cuenta tiene su propio carrito (clave por id de usuario); sin sesión hay uno de invitado.
// Así, al cerrar sesión el carrito de la cuenta no queda a la vista de la siguiente persona.

const KEY_PREFIX = "redal.cart.v2:";
const LEGACY_KEY = "redal.cart.v1";
const GUEST = "guest";
const EMPTY: CartItem[] = [];

/** null = sin sesión (invitado); undefined = todavía no se sabe quién es (la sesión se está resolviendo). */
export type CartOwner = string | null | undefined;

const keyFor = (owner: string | null) => `${KEY_PREFIX}${owner ?? GUEST}`;

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
const snapshots = new Map<string, { raw: string | null; items: CartItem[] }>();
// Si localStorage no está disponible (modo privado) el carrito vive solo en memoria, por cuenta.
const memoryOnly = new Map<string, CartItem[]>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function read(owner: string | null): CartItem[] {
  const key = keyFor(owner);
  const inMemory = memoryOnly.get(key);
  if (inMemory) return inMemory;

  const raw = readRaw(key);
  const cached = snapshots.get(key);
  // Misma referencia mientras lo guardado no cambie (requisito de useSyncExternalStore).
  if (cached && cached.raw === raw) return cached.items;
  const entry = { raw, items: parseCart(raw) };
  snapshots.set(key, entry);
  return entry.items;
}

function write(owner: string | null, items: CartItem[]) {
  const key = keyFor(owner);
  try {
    if (items.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(items));
    memoryOnly.delete(key);
  } catch {
    memoryOnly.set(key, items);
  }
}

export const cartStore = {
  getSnapshot(owner: CartOwner): CartItem[] {
    return owner === undefined ? EMPTY : read(owner);
  },

  getServerSnapshot: (): CartItem[] => EMPTY,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key?.startsWith(KEY_PREFIX) && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  dispatch(owner: CartOwner, action: CartAction): void {
    if (owner === undefined) return;
    write(owner, cartReducer(read(owner), action));
    notify();
  },

  /** Al iniciar sesión: pasa el carrito de invitado a la cuenta y lo borra del invitado. */
  adoptGuestCart(userId: string): void {
    const guest = read(null);
    if (guest.length === 0) return;
    write(userId, mergeCarts(read(userId), guest));
    write(null, EMPTY);
    notify();
  },

  /** Borra el carrito anterior (v1), que era compartido entre cuentas. */
  dropLegacy(): void {
    try {
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // Sin almacenamiento no hay nada que borrar.
    }
  },
};
