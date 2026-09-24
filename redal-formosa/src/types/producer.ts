export type ProducerCategory =
  | "horticultura"
  | "apicultura"
  | "fruticultura"
  | "granjas_y_huevos"
  | "lacteos_artesanales"
  | "harinas_y_granos"
  | "conservas_y_dulces";

export interface ProducerLocation {
  localidad: string; // ej: "Laguna Naineck", "El Colorado", "Clorinda", "Pirané", "Formosa Capital"
  departamento: string; // ej: "Pilcomayo", "Formosa", "Pirané"
  direccionFinca?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  zonaEntregaFrecuente: string[]; // ej: ["Feria Franca Barrio Paz", "Nodo Centro", "Reparto a Domicilio"]
}

export interface ProducerCertification {
  id: string;
  nombre: string; // ej: "Agroecológico Verificado", "Buenas Prácticas Agrícolas (BPA)", "Agricultura Familiar RENAF"
  emisor: string; // ej: "SENASA / IPAF NEA", "Ministerio de la Producción Formosa"
  icono?: string;
}

export interface ProducerContact {
  telefono: string;
  whatsapp: string; // Formato internacional ej: "5493704123456"
  email?: string;
  instagram?: string;
}

export interface DeliverySchedule {
  dia: string; // ej: "Miércoles", "Sábados"
  horario: string; // ej: "07:00 a 12:30"
  lugar: string; // ej: "Feria Franca - Paseo de Compras La Paz"
  tipo: "feria" | "domicilio" | "retiro_en_finca";
}

export interface Producer {
  id: string;
  slug: string;
  nombre: string; // Nombre del emprendimiento / chacra
  titular: string; // Nombre de la persona o familia productora
  avatarUrl: string;
  bannerUrl: string;
  rubroPrincipal: string; // ej: "Hortalizas de estación y mandioca"
  categorias: ProducerCategory[];
  descripcionCorta: string;
  historiaBio: string;
  metodosCultivo: string[]; // ej: ["Sin agroquímicos", "Riego por goteo", "Semillas criollas", "Compost natural"]
  ubicacion: ProducerLocation;
  certificaciones: ProducerCertification[];
  contacto: ProducerContact;
  puntosEntrega: DeliverySchedule[];
  tiempoRespuestaPromedio: string; // ej: "Menos de 2 horas"
  activoEnRedalDesde: string; // ej: "2024"
  aceptaB2B: boolean; // Si vende a restaurantes, verdulerías, hoteles
  pedidoMinimoMayorista?: number;
}
