/** Canal mayorista: reglas del formulario de solicitud. Puras y sin I/O. */

export const BUSINESS_TYPES = [
  { value: "restaurante", label: "Restaurante / Bar / Gastronomía" },
  { value: "verduleria", label: "Verdulería / Frutería" },
  { value: "supermercado", label: "Supermercado / Autoservicio" },
  { value: "hotel_catering", label: "Hotel / Catering" },
  { value: "distribuidor", label: "Distribuidor mayorista" },
  { value: "institucional", label: "Comedor institucional / escolar" },
] as const;

export const FREQUENCIES = [
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "pedido_unico", label: "Pedido único" },
  { value: "programado", label: "Programado a convenir" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];
export type Frequency = (typeof FREQUENCIES)[number]["value"];

export const businessLabel = (value: string) => BUSINESS_TYPES.find((b) => b.value === value)?.label ?? value;
export const frequencyLabel = (value: string) => FREQUENCIES.find((f) => f.value === value)?.label ?? value;

export interface B2BRequestInput {
  razonSocial: string;
  tipo: BusinessType;
  localidad: string;
  cuit: string;
  contacto: string;
  telefono: string;
  productos: string;
  volumen: string;
  frecuencia: Frequency;
  mensaje: string;
}

/** Solicitud tal como la ve quien la creó o un vendedor. */
export interface B2BRequest {
  id: string;
  razon_social: string;
  tipo_comercio: string;
  localidad: string;
  contacto_nombre: string;
  telefono: string;
  productos: string;
  volumen: string;
  frecuencia: string;
  mensaje: string | null;
  created_at: string;
  expires_at: string;
}

const LIMITS = { razonSocial: [2, 120], localidad: [2, 80], contacto: [2, 80], telefono: [6, 30], productos: [2, 300], volumen: [2, 200] } as const;
const MESSAGE_MAX = 500;

/** Devuelve el primer problema en lenguaje llano, o null si los datos son válidos. Espeja las restricciones de la tabla. */
export function validateB2BRequest(input: B2BRequestInput): string | null {
  const checks: [keyof typeof LIMITS, string][] = [
    ["razonSocial", "el nombre del comercio"],
    ["localidad", "la localidad"],
    ["contacto", "la persona de contacto"],
    ["telefono", "el teléfono"],
    ["productos", "los productos que buscás"],
    ["volumen", "el volumen estimado"],
  ];
  for (const [field, label] of checks) {
    const length = input[field].trim().length;
    const [min, max] = LIMITS[field];
    if (length < min) return `Completá ${label}.`;
    if (length > max) return `${label[0].toUpperCase()}${label.slice(1)} es demasiado largo (máximo ${max} caracteres).`;
  }
  const cuit = input.cuit.trim();
  if (cuit && !/^\d{2}-?\d{8}-?\d$/.test(cuit)) return "El CUIT debe tener 11 dígitos (ej: 30-12345678-9).";
  if (input.mensaje.length > MESSAGE_MAX) return `Las observaciones admiten hasta ${MESSAGE_MAX} caracteres.`;
  return null;
}

/** Días que le quedan a una solicitud abierta (mínimo 0). */
export function daysLeft(expiresAt: string, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / 86_400_000));
}

/** Mensaje de WhatsApp de un vendedor al comercio que pidió cotización. */
export function offerMessage(request: Pick<B2BRequest, "contacto_nombre" | "razon_social" | "productos">, seller: string): string {
  const first = request.contacto_nombre.split(" ")[0] || "";
  return `Hola${first ? ` ${first}` : ""}, te escribe ${seller} de RedAL Formosa. Vi la solicitud de ${request.razon_social} (${request.productos}) y quiero pasarte precios y condiciones.`;
}
