import { Producer } from "@/types";

export const MOCK_PRODUCERS: Record<string, Producer> = {
  "chacra-la-esperanza": {
    id: "chacra-la-esperanza",
    slug: "chacra-la-esperanza",
    nombre: "Chacra Agroecológica La Esperanza",
    titular: "Familia Gómez & Asoc.",
    avatarUrl:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300",
    bannerUrl:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200",
    rubroPrincipal: "Hortalizas de estación, raíces formoseñas y verdeos",
    categorias: ["horticultura", "fruticultura"],
    descripcionCorta:
      "Producción agroecológica familiar en Laguna Naineck. Cosecha fresca recolectada horas antes de la entrega.",
    historiaBio:
      "Somos una familia productora de tercera generación asentada en las fértiles tierras de Laguna Naineck. Desde el año 2018 abandonamos por completo el uso de agroquímicos sintéticos, apostando a biofertilizantes elaborados en la propia chacra, consorcios de plantas y rotación de suelos. Abastecemos semanalmente ferias locales y distribuimos alimentos sanos y vitales en toda la región.",
    metodosCultivo: [
      "100% Sin pesticidas químicos",
      "Bioinsumos y compostaje propio",
      "Riego eficiente por goteo",
      "Semillas criollas adaptadas al clima formoseño",
    ],
    ubicacion: {
      localidad: "Laguna Naineck",
      departamento: "Pilcomayo, Formosa",
      direccionFinca: "Ruta Nacional 86, Km 1326",
      zonaEntregaFrecuente: [
        "Feria Franca - Paseo La Paz (Formosa Cap.)",
        "Punto Verde Barrio San Martín",
        "Reparto a domicilio coordinado",
      ],
    },
    certificaciones: [
      {
        id: "cert-1",
        nombre: "Transición Agroecológica Acreditada",
        emisor: "IPAF NEA - INTA / Ministerio de la Producción Formosa",
      },
      {
        id: "cert-2",
        nombre: "Buenas Prácticas Agrícolas (BPA)",
        emisor: "SENASA",
      },
      {
        id: "cert-3",
        nombre: "Registro Nacional de la Agricultura Familiar",
        emisor: "RENAF N° 34-8921",
      },
    ],
    contacto: {
      telefono: "+54 370 458-9214",
      whatsapp: "5493704589214",
      email: "contacto@chacralaesperanza.redal.ar",
      instagram: "@chacralaesperanza_fsa",
    },
    puntosEntrega: [
      {
        dia: "Miércoles",
        horario: "07:30 a 12:30",
        lugar: "Feria Franca La Paz - Puesto N° 14 (Formosa Capital)",
        tipo: "feria",
      },
      {
        dia: "Sábados",
        horario: "07:00 a 13:00",
        lugar: "Polideportivo Policial - Nódulo Frutihortícola",
        tipo: "feria",
      },
      {
        dia: "Jueves por la tarde",
        horario: "15:00 a 19:00",
        lugar: "Entrega a domicilio (Zonas Centro, Fontana, San Pedro)",
        tipo: "domicilio",
      },
    ],
    tiempoRespuestaPromedio: "Responde habitualmente en 1 a 2 horas",
    activoEnRedalDesde: "2024",
    aceptaB2B: true,
    pedidoMinimoMayorista: 30000,
  },
  "apicultura-monte-adentro": {
    id: "apicultura-monte-adentro",
    slug: "apicultura-monte-adentro",
    nombre: "Miel & Néctar Monte Adentro",
    titular: "Roberto Benítez",
    avatarUrl:
      "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&q=80&w=300",
    bannerUrl:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=1200",
    rubroPrincipal: "Miel pura de monte chaqueño y polen multifloral",
    categorias: ["apicultura", "conservas_y_dulces"],
    descripcionCorta:
      "Colmenas ubicadas en los montes nativos de El Colorado. Miel pura sin filtrar ni pasteurizar.",
    historiaBio:
      "Producimos miel de monte virgen libre de pesticidas, cosechando con respeto a los ciclos biológicos de las abejas criollas e italianas adaptadas al calor formoseño.",
    metodosCultivo: [
      "Colmenas en monte nativo",
      "Extracción en frío sin calor artificial",
      "Trazabilidad por lote de floración",
    ],
    ubicacion: {
      localidad: "El Colorado",
      departamento: "Pirané, Formosa",
      zonaEntregaFrecuente: ["Formosa Capital", "El Colorado", "Pirané"],
    },
    certificaciones: [
      {
        id: "cert-api-1",
        nombre: "Miel de Monte Chaqueño Origen Controlado",
        emisor: "Asoc. Apícola Río Bermejo",
      },
    ],
    contacto: {
      telefono: "+54 370 411-8899",
      whatsapp: "5493704118899",
    },
    puntosEntrega: [
      {
        dia: "Viernes",
        horario: "09:00 a 16:00",
        lugar: "Despachos semanales a puntos de retiro en Formosa Capital",
        tipo: "domicilio",
      },
    ],
    tiempoRespuestaPromedio: "Responde en el día",
    activoEnRedalDesde: "2024",
    aceptaB2B: true,
    pedidoMinimoMayorista: 45000,
  },
};

export const DEFAULT_PRODUCER = MOCK_PRODUCERS["chacra-la-esperanza"];

export function getProducerById(idOrSlug: string): Producer {
  return MOCK_PRODUCERS[idOrSlug] || {
    ...DEFAULT_PRODUCER,
    id: idOrSlug,
    nombre: `Chacra ${idOrSlug.replace(/-/g, " ").toUpperCase()}`,
  };
}
