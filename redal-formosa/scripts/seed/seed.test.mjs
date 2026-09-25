import { describe, expect, it } from "vitest";

import { CATEGORIES, PRODUCERS, PRODUCTS } from "./data.mjs";
import { categoryFactory, emprendimientoFactory, placeholderImage, productFactory, slugify, VALID_UNITS } from "./factories.mjs";

describe("datos de prueba", () => {
  it("cubre lo pedido: 5 productores, 6 categorías y al menos 15 productos", () => {
    expect(PRODUCERS).toHaveLength(5);
    expect(CATEGORIES).toHaveLength(6);
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(15);
  });

  it("no usa datos genéricos", () => {
    const text = JSON.stringify([PRODUCERS, PRODUCTS]).toLowerCase();
    for (const banned of ["lorem", "ipsum", "producto a", "producto b", "computadora", "item 1"]) {
      expect(text).not.toContain(banned);
    }
  });

  it("incluye los productos regionales obligatorios", () => {
    const names = PRODUCTS.map((p) => p.nombre.toLowerCase()).join(" | ");
    for (const required of ["mandioca", "miel de monte", "chipá", "zapallo plomo", "calabaza", "queso criollo", "mamón", "harina de maíz", "huevos"]) {
      expect(names).toContain(required);
    }
    expect(names).toContain("500 g");
    expect(names).toContain("1 kg");
  });

  it("usa unidades válidas y precios enteros y positivos", () => {
    for (const p of PRODUCTS) {
      expect(VALID_UNITS).toContain(p.unidad);
      expect(Number.isInteger(p.precio)).toBe(true);
      expect(p.precio).toBeGreaterThan(0);
    }
  });

  it("cada producto apunta a un productor y a una categoría existentes, con descripción breve", () => {
    const producers = new Set(PRODUCERS.map((p) => p.key));
    const categories = new Set(CATEGORIES.map((c) => c.nombre));
    for (const p of PRODUCTS) {
      expect(producers.has(p.producer)).toBe(true);
      expect(categories.has(p.category)).toBe(true);
      expect(p.descripcion.length).toBeGreaterThan(30);
      expect(p.descripcion.length).toBeLessThan(220);
    }
  });

  it("no repite nombres dentro de un mismo productor ni claves de productor", () => {
    const seen = new Set();
    for (const p of PRODUCTS) {
      const id = `${p.producer}:${p.nombre}`;
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
    expect(new Set(PRODUCERS.map((p) => p.key)).size).toBe(PRODUCERS.length);
  });

  it("todas las categorías tienen productos y todos los productores tienen catálogo", () => {
    for (const c of CATEGORIES) expect(PRODUCTS.some((p) => p.category === c.nombre)).toBe(true);
    for (const producer of PRODUCERS) expect(PRODUCTS.some((p) => p.producer === producer.key)).toBe(true);
  });

  it("ubica a los productores dentro de la provincia de Formosa", () => {
    for (const p of PRODUCERS) {
      expect(p.latitud).toBeGreaterThan(-27.6);
      expect(p.latitud).toBeLessThan(-22.4);
      expect(p.longitud).toBeGreaterThan(-62.4);
      expect(p.longitud).toBeLessThan(-57.5);
      expect(p.telefono).toMatch(/^3704\d{6}$/);
    }
  });
});

describe("factories", () => {
  it("slugify quita acentos y símbolos", () => {
    expect(slugify("Frutas y Verduras de estación")).toBe("frutas-y-verduras-de-estacion");
    expect(slugify("Panificados y Tradición")).toBe("panificados-y-tradicion");
  });

  it("los slugs de las categorías son únicos", () => {
    const slugs = CATEGORIES.map((c) => categoryFactory(c).slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("arma el emprendimiento con dueño y coordenadas", () => {
    const row = emprendimientoFactory(PRODUCERS[0], "owner-1");
    expect(row).toMatchObject({ owner_id: "owner-1", nombre: "Chacra El Sol", activo: true });
    expect(row.email).toMatch(/@seed\.redal\.test$/);
  });

  it("arma el producto validado con imagen de relleno estable", () => {
    const row = productFactory(PRODUCTS[0], { emprendimientoId: "e1", categoriaId: "c1", index: 0 });
    expect(row).toMatchObject({ emprendimiento_id: "e1", categoria_id: "c1", validado: true, disponible: true });
    expect(row.imagen_url).toBe(placeholderImage("cassava", 0));
    expect(row.imagen_url).toMatch(/^https:\/\/picsum\.photos\/seed\/cassava-0\//);
  });

  it("rechaza unidades o precios inválidos", () => {
    const base = { ...PRODUCTS[0] };
    expect(() => productFactory({ ...base, unidad: "cajón" }, { emprendimientoId: "e", categoriaId: "c", index: 0 })).toThrow(/Unidad/);
    expect(() => productFactory({ ...base, precio: 2500.99 }, { emprendimientoId: "e", categoriaId: "c", index: 0 })).toThrow(/Precio/);
  });
});
