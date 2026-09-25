import { UnitOfMeasure } from "./product";

export type BusinessType =
  | "restaurante_gastronomico"
  | "verduleria_fruteria"
  | "supermercado_autoservicio"
  | "hotel_catering"
  | "distribuidor_mayorista"
  | "institucional_comedor";

export interface B2BQuoteRequest {
  id?: string;
  razonSocial: string;
  tipoComercio: BusinessType;
  cuitOpcional?: string;
  localidadEntrega: string; // ej: "Formosa Capital", "Clorinda", "Pirané"
  direccionEntrega: string;
  contactoNombre: string;
  telefonoWhatsapp: string;
  email: string;
  frecuenciaRequerida: "semanal" | "quincenal" | "pedido_unico" | "programado";
  items: Array<{
    productoId?: string;
    nombreProducto: string;
    volumenEstimado: number;
    unidadMedida: UnitOfMeasure;
    observaciones?: string;
  }>;
  mensajeAdicional?: string;
}

export interface B2BFeaturedDeal {
  id: string;
  productorId: string;
  productorNombre: string;
  productorLocalidad: string;
  productoNombre: string;
  descripcionCorta: string;
  volumenMinimo: string; // ej: "Desde 10 cajones"
  precioMayorista: number;
  unidadMedida: UnitOfMeasure;
  ahorroEstimadoPorcentaje: number;
  fotoUrl: string;
  frecuenciaCosecha: string; // ej: "Lunes y Jueves"
  capacidadSemanalKg: number;
}
