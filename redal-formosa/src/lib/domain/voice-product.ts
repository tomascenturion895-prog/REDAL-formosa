/** Borrador de producto que sale de la voz del vendedor. Reglas puras: sin I/O. */

export const PRODUCT_UNITS = ["unidad", "kg", "litro", "metro", "pack"] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export interface VoiceProductDraft {
  producto: string;
  /** Lo que el vendedor dijo tener disponible; hoy no se guarda como stock, solo se informa. */
  cantidad: number | null;
  precio: number | null;
  unidad: ProductUnit;
}

const UNIT_ALIASES: Record<string, ProductUnit> = {
  unidad: "unidad",
  unidades: "unidad",
  u: "unidad",
  un: "unidad",
  docena: "pack",
  docenas: "pack",
  kg: "kg",
  kgs: "kg",
  kilo: "kg",
  kilos: "kg",
  kilogramo: "kg",
  kilogramos: "kg",
  litro: "litro",
  litros: "litro",
  l: "litro",
  lt: "litro",
  lts: "litro",
  metro: "metro",
  metros: "metro",
  m: "metro",
  pack: "pack",
  packs: "pack",
  paquete: "pack",
  paquetes: "pack",
  bolsa: "pack",
  bolsas: "pack",
  caja: "pack",
  cajas: "pack",
};

export function normalizeUnit(raw: unknown): ProductUnit {
  if (typeof raw !== "string") return "unidad";
  return UNIT_ALIASES[raw.trim().toLowerCase()] ?? "unidad";
}

function positiveNumber(raw: unknown): number | null {
  const value = typeof raw === "string" ? Number(raw.replace(",", ".")) : raw;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Valida lo que devolvió el modelo. Nunca se confía en su forma: si falta el nombre se rechaza;
 * los números inválidos pasan a null y la unidad desconocida a "unidad".
 */
export function parseDraft(raw: unknown): VoiceProductDraft | null {
  if (typeof raw !== "object" || raw === null) return null;
  const data = raw as Record<string, unknown>;

  const producto = typeof data.producto === "string" ? data.producto.trim().slice(0, 120) : "";
  if (!producto) return null;

  return {
    producto,
    cantidad: positiveNumber(data.cantidad),
    precio: positiveNumber(data.precio),
    unidad: normalizeUnit(data.unidad),
  };
}

/** Texto para la descripción cuando el vendedor mencionó cuánto tiene. */
export function stockNote(draft: Pick<VoiceProductDraft, "cantidad" | "unidad">): string {
  if (draft.cantidad === null) return "";
  return `Disponibles: ${draft.cantidad} ${draft.unidad === "unidad" ? "u" : draft.unidad}.`;
}
