import { Product } from "@/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    productorId: "chacra-la-esperanza",
    nombre: "Mandioca Criolla Seleccionada",
    variedad: "Rama Negra (Cáscara fina y cocción rápida)",
    descripcion:
      "Mandioca fresca recién extraída del suelo arenoso de Laguna Naineck. Se cocina en 15 a 20 minutos quedando suave y cremosa. Cero fibras leñosas.",
    categoria: "raices_tuberculos",
    precioMinorista: 1200,
    unidadMedida: "kg",
    stockEstado: "disponible",
    cantidadDisponibleEstimada: 350,
    esDeEstacion: true,
    cosechaReciente: true,
    esAgroecologico: true,
    fotoUrl:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=500",
    diasCosecha: ["Martes", "Viernes"],
    etiquetasDestacadas: ["Top Ventas", "Cosecha Fresca"],
    preciosMayoristas: [
      {
        minimoUnidades: 30, // 30 kg o bolsa
        precioUnitario: 850,
        etiqueta: "Bolsa 30kg (Mayorista)",
      },
      {
        minimoUnidades: 150,
        precioUnitario: 720,
        etiqueta: "Volumen Comercial (+150kg)",
      },
    ],
  },
  {
    id: "prod-2",
    productorId: "chacra-la-esperanza",
    nombre: "Tomate Platense Criollo de Campo",
    variedad: "Semilla tradicional recuperada",
    descripcion:
      "Tomates carnosos madurados al sol en mata, con el auténtico sabor y perfume del tomate tradicional. Sin cámaras frigoríficas ni maduración forzada.",
    categoria: "verduras",
    precioMinorista: 2400,
    unidadMedida: "kg",
    stockEstado: "disponible",
    cantidadDisponibleEstimada: 120,
    esDeEstacion: true,
    cosechaReciente: true,
    esAgroecologico: true,
    fotoUrl:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=500",
    diasCosecha: ["Martes", "Jueves"],
    etiquetasDestacadas: ["Sabor Intenso", "Madurado en Planta"],
    preciosMayoristas: [
      {
        minimoUnidades: 18, // Cajón de 18-20kg
        precioUnitario: 1750,
        etiqueta: "Cajón completo (18kg)",
      },
    ],
  },
  {
    id: "prod-3",
    productorId: "chacra-la-esperanza",
    nombre: "Acelga Criolla de Hoja Ancha",
    variedad: "Verde oscura penca ancha",
    descripcion:
      "Atados abundantes de acelga tierna y fresca, cortada a primera hora de la mañana para mantener la turgencia y nutrientes.",
    categoria: "verduras",
    precioMinorista: 1100,
    unidadMedida: "atado",
    stockEstado: "disponible",
    cantidadDisponibleEstimada: 85,
    esDeEstacion: true,
    cosechaReciente: true,
    esAgroecologico: true,
    fotoUrl:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=500",
    etiquetasDestacadas: ["Corte del Día"],
    preciosMayoristas: [
      {
        minimoUnidades: 12,
        precioUnitario: 800,
        etiqueta: "Docena de atados",
      },
    ],
  },
  {
    id: "prod-4",
    productorId: "chacra-la-esperanza",
    nombre: "Rúcula Selvática Silvestre",
    variedad: "Sabor picante característico",
    descripcion:
      "Cultivada bajo media sombra en cama de compost. Ideal para ensaladas frescas de verano, pizzas y gastronomía gourmet.",
    categoria: "verduras",
    precioMinorista: 950,
    unidadMedida: "atado",
    stockEstado: "stock_bajo",
    cantidadDisponibleEstimada: 18,
    esDeEstacion: true,
    cosechaReciente: true,
    esAgroecologico: true,
    fotoUrl:
      "https://images.unsplash.com/photo-1628773822503-930a84568600?auto=format&fit=crop&q=80&w=500",
    etiquetasDestacadas: ["Stock Limitado"],
  },
  {
    id: "prod-5",
    productorId: "chacra-la-esperanza",
    nombre: "Batata Dulce Morada del Litoral",
    variedad: "Cáscara púrpura pulpa dorada",
    descripcion:
      "Batatas seleccionadas para horno o puré. Textura cremosa y alto tenor de dulzura natural.",
    categoria: "raices_tuberculos",
    precioMinorista: 1400,
    unidadMedida: "kg",
    stockEstado: "disponible",
    cantidadDisponibleEstimada: 200,
    esDeEstacion: true,
    cosechaReciente: false,
    esAgroecologico: true,
    fotoUrl:
      "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&q=80&w=500",
    preciosMayoristas: [
      {
        minimoUnidades: 20,
        precioUnitario: 980,
        etiqueta: "Bolsa 20kg",
      },
    ],
  },
  {
    id: "prod-6",
    productorId: "chacra-la-esperanza",
    nombre: "Zapallo Plomo Criollo Formoseño",
    variedad: "Semilla tradicional chaqueña",
    descripcion:
      "Zapallo entero o fraccionado con pulpa firme color naranja intenso. Excelente conservación y apto para locros, pucheros y puré.",
    categoria: "verduras",
    precioMinorista: 1300,
    unidadMedida: "kg",
    stockEstado: "disponible",
    cantidadDisponibleEstimada: 450,
    esDeEstacion: true,
    cosechaReciente: false,
    esAgroecologico: true,
    fotoUrl:
      "https://images.unsplash.com/photo-1570586435893-ab4e76a6b8e3?auto=format&fit=crop&q=80&w=500",
    preciosMayoristas: [
      {
        minimoUnidades: 50,
        precioUnitario: 890,
        etiqueta: "Lote por bolsa (+50kg)",
      },
    ],
  },
  {
    id: "prod-7",
    productorId: "chacra-la-esperanza",
    nombre: "Pomelo Rosado y Limones Criollos",
    variedad: "Cítricos de quinta Laguna Naineck",
    descripcion:
      "Frutas jugosas sin ceras sintéticas ni tratamientos post-cosecha. Muy aromáticas para jugos y consumo diario.",
    categoria: "frutas",
    precioMinorista: 1800,
    unidadMedida: "docena",
    stockEstado: "proxima_cosecha",
    cantidadDisponibleEstimada: 0,
    esDeEstacion: true,
    cosechaReciente: false,
    esAgroecologico: true,
    fotoUrl:
      "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80&w=500",
    etiquetasDestacadas: ["Cosecha en 5 días"],
  },
];

export function getProductsByProducer(productorId: string): Product[] {
  const filtered = MOCK_PRODUCTS.filter((p) => p.productorId === productorId);
  return filtered.length > 0 ? filtered : MOCK_PRODUCTS;
}
