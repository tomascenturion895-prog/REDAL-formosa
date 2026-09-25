import { describe, expect, it } from "vitest";

import { normalizeUnit, parseDraft, stockNote } from "./voice-product";

describe("normalizeUnit", () => {
  it.each([
    ["kilos", "kg"],
    ["Kilogramos", "kg"],
    ["litros", "litro"],
    ["docena", "pack"],
    ["cajas", "pack"],
    ["algo raro", "unidad"],
  ])("%s -> %s", (raw, expected) => expect(normalizeUnit(raw)).toBe(expected));

  it("devuelve unidad ante valores no textuales", () => {
    expect(normalizeUnit(undefined)).toBe("unidad");
    expect(normalizeUnit(42)).toBe("unidad");
  });
});

describe("parseDraft", () => {
  it("acepta un borrador completo", () => {
    expect(parseDraft({ producto: " Zapallo ", cantidad: 10, precio: 1000, unidad: "kilos" })).toEqual({
      producto: "Zapallo",
      cantidad: 10,
      precio: 1000,
      unidad: "kg",
    });
  });

  it("convierte números en texto y descarta los inválidos", () => {
    const draft = parseDraft({ producto: "Miel", cantidad: "2,5", precio: -3, unidad: "litro" });
    expect(draft).toMatchObject({ cantidad: 2.5, precio: null, unidad: "litro" });
  });

  it("rechaza lo que no tiene nombre o no es un objeto", () => {
    expect(parseDraft({ producto: "  " })).toBeNull();
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft("zapallo")).toBeNull();
  });

  it("recorta nombres desmesurados", () => {
    expect(parseDraft({ producto: "a".repeat(500) })?.producto).toHaveLength(120);
  });
});

describe("stockNote", () => {
  it("describe la cantidad con su unidad", () => {
    expect(stockNote({ cantidad: 10, unidad: "kg" })).toBe("Disponibles: 10 kg.");
    expect(stockNote({ cantidad: 6, unidad: "unidad" })).toBe("Disponibles: 6 u.");
    expect(stockNote({ cantidad: 2.5, unidad: "litro" })).toBe("Disponibles: 2.5 litro.");
  });

  it("queda vacío sin cantidad", () => {
    expect(stockNote({ cantidad: null, unidad: "kg" })).toBe("");
  });
});
