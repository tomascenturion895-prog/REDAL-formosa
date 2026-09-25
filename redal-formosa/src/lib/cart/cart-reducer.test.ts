import { describe, expect, it } from "vitest";

import { cartReducer, groupByStore, mergeCarts, MAX_QUANTITY, type CartItem, type CartProduct } from "./cart-reducer";
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

  it("permite productos de varios emprendimientos en el mismo carrito", () => {
    const next = cartReducer([line("a", 1, "store-1")], { type: "add", producto: product("b", "store-2"), cantidad: 1 });
    expect(next).toEqual([line("a", 1, "store-1"), line("b", 1, "store-2")]);
  });

  it("clearStore vacía solo la cesta de ese emprendimiento", () => {
    const items = [line("a", 1, "store-1"), line("b", 2, "store-2"), line("c", 1, "store-1")];
    expect(cartReducer(items, { type: "clearStore", emprendimientoId: "store-1" })).toEqual([line("b", 2, "store-2")]);
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

describe("groupByStore", () => {
  it("arma una cesta por emprendimiento con su subtotal, envío y total", () => {
    const groups = groupByStore([line("a", 2, "store-1"), line("b", 1, "store-2"), line("c", 1, "store-1")]);
    expect(groups.map((g) => g.emprendimientoId)).toEqual(["store-1", "store-2"]);
    // 2 x 100 + 1 x 100 = 300; envío 100 + 50 x 2 líneas = 200
    expect(groups[0]).toMatchObject({ subtotal: 300, envio: 200, total: 500, itemCount: 3 });
    expect(groups[1]).toMatchObject({ subtotal: 100, envio: 150, total: 250, itemCount: 1 });
  });

  it("un carrito vacío no tiene cestas", () => {
    expect(groupByStore([])).toEqual([]);
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

describe("mergeCarts", () => {
  it("suma cantidades del mismo emprendimiento", () => {
    const merged = mergeCarts([line("a", 2)], [line("a", 1), line("b")]);
    expect(merged).toEqual([line("a", 3), line("b")]);
  });

  it("conserva las cestas de distintos emprendimientos", () => {
    expect(mergeCarts([line("a")], [line("z", 1, "store-2")])).toEqual([line("a"), line("z", 1, "store-2")]);
  });

  it("no cambia nada si no hay carrito de invitado", () => {
    const saved = [line("a")];
    expect(mergeCarts(saved, [])).toBe(saved);
  });
});
