export type UnitOfMeasure =
  | "kg"
  | "atado"
  | "cajon"
  | "docena"
  | "unidad"
  | "bolsa_10kg"
  | "frasco_500g"
  | "litro";

export type StockStatus = "disponible" | "stock_bajo" | "proxima_cosecha" | "agotado";

export interface WholesaleTier {
  minimoUnidades: number; // ej: a partir de 5 cajones
  precioUnitario: number; // Precio con descuento por bulto/volumen
  etiqueta: string; // ej: "Precio Mayorista / Comercio"
}

export interface Product {
  id: string;
  productorId: string;
  nombre: string;
  variedad?: string; // ej: "Mandioca Amarilla Criolla", "Tomate Platense", "Miel de Azahar"
  descripcion: string;
  categoria:
    | "verduras"
    | "frutas"
    | "raices_tuberculos"
    | "apicultura"
    | "procesados_artesanales"
    | "hierbas_aromaticas";
  precioMinorista: number; // En ARS ($)
  unidadMedida: UnitOfMeasure;
  stockEstado: StockStatus;
  cantidadDisponibleEstimada: number;
  esDeEstacion: boolean;
  cosechaReciente: boolean;
  esAgroecologico: boolean;
  fotoUrl: string;
  preciosMayoristas?: WholesaleTier[]; // Disponibilidad para compras B2B
  diasCosecha?: string[]; // ej: ["Lunes", "Jueves"]
  etiquetasDestacadas?: string[]; // ej: ["Recién cosechado", "Oferta semanal", "Imperdible"]
}
