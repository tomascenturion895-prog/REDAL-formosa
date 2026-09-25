import { describe, expect, it } from "vitest";

import { cartReducer, conflictsWithCart, MAX_QUANTITY, type CartItem, type CartProduct } from "./cart-reducer";
import { parseCart } from "./cart-store";

const product = (id: string, store = "store-1", precio = 100): CartProduct => ({
  id,
  nombre: `Producto ${id}`,
  precio,
  unidad: "unidad",
  imagen_url: null,
  emprendimiento_id: store,
});

const line = (id: string, cantidad = 1, store = "store-1"): CartItem => ({ producto: product(id, store), cantidad });

describe("cartReducer", () => {
  it("agrega un producto nuevo", () => {
    const next = cartReducer([], { type: "add", producto: product("a"), cantidad: 2 });
    expect(next).toEqual([line("a", 2)]);
  });

  it("suma la cantidad si el producto ya estaba", () => {
    const next = cartReducer([line("a", 2)], { type: "add", producto: product("a"), cantidad: 3 });
    expect(next).toEqual([line("a", 5)]);
  });

  it("no supera la cantidad máxima", () => {
    const next = cartReducer([line("a", MAX_QUANTITY)], { type: "add", producto: product("a"), cantidad: 5 });
    expect(next[0].cantidad).toBe(MAX_QUANTITY);
  });

  it("reemplaza el carrito cuando se pide vaciar el de otro emprendimiento", () => {
    const next = cartReducer([line("a", 1, "store-1")], {
      type: "add",
      producto: product("b", "store-2"),
      cantidad: 1,
      replaceOtherStore: true,
    });
    expect(next).toEqual([line("b", 1, "store-2")]);
  });

  it("setQuantity con 0 o menos quita el producto", () => {
    expect(cartReducer([line("a", 2), line("b")], { type: "setQuantity", productoId: "a", cantidad: 0 })).toEqual([line("b")]);
  });

  it("setQuantity actualiza y respeta el límite", () => {
    const next = cartReducer([line("a", 2)], { type: "setQuantity", productoId: "a", cantidad: 500 });
    expect(next[0].cantidad).toBe(MAX_QUANTITY);
  });

  it("remove y clear", () => {
    expect(cartReducer([line("a"), line("b")], { type: "remove", productoId: "a" })).toEqual([line("b")]);
    expect(cartReducer([line("a")], { type: "clear" })).toEqual([]);
  });

  it("no muta el estado anterior", () => {
    const original = [line("a", 1)];
    cartReducer(original, { type: "add", producto: product("a"), cantidad: 1 });
    expect(original[0].cantidad).toBe(1);
  });
});

describe("conflictsWithCart", () => {
  it("un carrito vacío nunca tiene conflicto", () => {
    expect(conflictsWithCart([], product("a", "store-9"))).toBe(false);
  });

  it("detecta un producto de otro emprendimiento", () => {
    expect(conflictsWithCart([line("a", 1, "store-1")], product("b", "store-2"))).toBe(true);
    expect(conflictsWithCart([line("a", 1, "store-1")], product("b", "store-1"))).toBe(false);
  });
});

describe("parseCart", () => {
  it("devuelve vacío ante datos ausentes o corruptos", () => {
    expect(parseCart(null)).toEqual([]);
    expect(parseCart("no es json")).toEqual([]);
    expect(parseCart('{"no":"es lista"}')).toEqual([]);
  });

  it("descarta ítems con forma inválida y conserva los válidos", () => {
    const raw = JSON.stringify([line("a", 2), { producto: { id: 1 }, cantidad: 2 }, { cantidad: -1 }, line("b", 1.5)]);
    expect(parseCart(raw)).toEqual([line("a", 2)]);
  });
});
