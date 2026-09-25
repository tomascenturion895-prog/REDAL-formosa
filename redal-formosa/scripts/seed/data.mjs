// Datos de prueba de RedAL Formosa: productores, clientes, categorías y productos con sabor local.
// Los precios son en pesos argentinos, redondos y de referencia (feria/venta directa); ajustarlos cuando cambien.
// Los teléfonos y emails son ficticios (dominio reservado .test): no pertenecen a nadie.

export const SEED_EMAIL_DOMAIN = "seed.redal.test";

/** Unidades que entiende el formulario de productos: unidad | kg | litro | metro | pack. */
export const CATEGORIES = [
  { nombre: "Frutas y Verduras de estación" },
  { nombre: "Miel y Derivados" },
  { nombre: "Panificados y Tradición" },
  { nombre: "Conservas y Escabeches" },
  { nombre: "Lácteos y Quesos" },
  { nombre: "Artesanías y Textiles" },
];

export const CUSTOMERS = [
  { key: "lucia", nombre: "Lucía Fernández" },
  { key: "matias", nombre: "Matías Acosta" },
];

export const PRODUCERS = [
  {
    key: "chacraelsol",
    owner: "Ramón Benítez",
    nombre: "Chacra El Sol",
    localidad: "Laguna Blanca",
    descripcion:
      "Chacra familiar sobre el río Pilcomayo. Cultivamos mandioca, zapallo y batata sin agrotóxicos, y cosechamos miel de monte de nuestras propias colmenas.",
    direccion: "Ruta Provincial 28, Laguna Blanca, Formosa",
    telefono: "3704000101",
    latitud: -25.1247,
    longitud: -58.2379,
  },
  {
    key: "coopirane",
    owner: "Elvira Cabral",
    nombre: "Cooperativa Agrícola Pirané",
    localidad: "Pirané",
    descripcion:
      "Cooperativa de productores del centro de la provincia: maíz, zapallo y hortalizas de la zona, más el taller de tejedoras con palma karanday.",
    direccion: "Acceso Sur, Pirané, Formosa",
    telefono: "3704000102",
    latitud: -25.7301,
    longitud: -59.1123,
  },
  {
    key: "bogado",
    owner: "Cecilia Bogado",
    nombre: "Familia Bogado",
    localidad: "El Colorado",
    descripcion:
      "Cocina de la abuela hecha negocio: chipá, mbejú, dulces de fruta de patio y huevos de nuestras gallinas criadas sueltas.",
    direccion: "Barrio Centro, El Colorado, Formosa",
    telefono: "3704000103",
    latitud: -26.3167,
    longitud: -59.3667,
  },
  {
    key: "abuelos",
    owner: "Arístides Romero",
    nombre: "Huerta Los Abuelos",
    localidad: "Formosa Capital",
    descripcion:
      "Huerta agroecológica en la periferia de la capital. Verduras de hoja y de estación, y conservas caseras que se preparan por tandas chicas.",
    direccion: "Barrio Eva Perón, Formosa Capital",
    telefono: "3704000104",
    latitud: -26.1775,
    longitud: -58.1781,
  },
  {
    key: "querencia",
    owner: "Norberto Gómez",
    nombre: "Tambo La Querencia",
    localidad: "Ibarreta",
    descripcion:
      "Tambo y quesería de campo al norte de la provincia. Quesos y dulces elaborados con leche de nuestro propio rodeo, en pequeñas partidas.",
    direccion: "Zona rural, Ibarreta, Formosa",
    telefono: "3704000105",
    latitud: -25.2078,
    longitud: -59.8601,
  },
];

const FRUTAS = "Frutas y Verduras de estación";
const MIEL = "Miel y Derivados";
const PAN = "Panificados y Tradición";
const CONSERVAS = "Conservas y Escabeches";
const LACTEOS = "Lácteos y Quesos";
const ARTESANIAS = "Artesanías y Textiles";

// term: búsqueda en inglés para el placeholder de imagen (ver factories.placeholderImage).
export const PRODUCTS = [
  // --- Chacra El Sol ---
  {
    producer: "chacraelsol", category: FRUTAS, term: "cassava",
    nombre: "Mandioca fresca", unidad: "kg", precio: 1500,
    descripcion: "Mandioca recién arrancada de la chacra, tierna y de buena cocción. Cultivada sin agrotóxicos.",
  },
  {
    producer: "chacraelsol", category: FRUTAS, term: "cassava",
    nombre: "Cajón de mandioca fresca (10 kg)", unidad: "unidad", precio: 12000,
    descripcion: "Cajón de 10 kilos de mandioca de cosecha del día, ideal para familias o para revender. Sin agrotóxicos.",
  },
  {
    producer: "chacraelsol", category: FRUTAS, term: "pumpkin",
    nombre: "Zapallo plomo", unidad: "kg", precio: 1200,
    descripcion: "Zapallo plomo de pulpa firme y dulce, criado a campo abierto. Perfecto para sopas, puré y locro.",
  },
  {
    producer: "chacraelsol", category: FRUTAS, term: "sweet potato",
    nombre: "Batata colorada", unidad: "kg", precio: 1800,
    descripcion: "Batata de pulpa anaranjada, dulce y cremosa al horno. Cosecha fresca, sin agrotóxicos.",
  },
  {
    producer: "chacraelsol", category: MIEL, term: "honey jar",
    nombre: "Miel de monte (frasco 500 g)", unidad: "unidad", precio: 6500,
    descripcion: "Miel pura de monte nativo, cosechada y fraccionada en casa. Sin aditivos ni calentado.",
  },
  {
    producer: "chacraelsol", category: MIEL, term: "honey jar",
    nombre: "Miel de monte (frasco 1 kg)", unidad: "unidad", precio: 11500,
    descripcion: "El frasco grande de nuestra miel de monte: aroma intenso y sabor de flores del chaco. Hecha en casa, sin agregados.",
  },

  // --- Cooperativa Agrícola Pirané ---
  {
    producer: "coopirane", category: PAN, term: "corn flour",
    nombre: "Harina de maíz amarillo tostado (1 kg)", unidad: "unidad", precio: 3000,
    descripcion: "Maíz amarillo cultivado en Pirané, tostado y molido en piedra. Ideal para tortillas, polenta y postres regionales.",
  },
  {
    producer: "coopirane", category: PAN, term: "corn",
    nombre: "Maíz pisado para locro (1 kg)", unidad: "unidad", precio: 2800,
    descripcion: "Maíz blanco pisado a la manera tradicional, listo para tu locro. Cosecha propia, sin conservantes.",
  },
  {
    producer: "coopirane", category: FRUTAS, term: "squash",
    nombre: "Calabaza criolla", unidad: "kg", precio: 1000,
    descripcion: "Calabaza criolla de cáscara verde y pulpa naranja intensa. Cultivo tradicional, sin agrotóxicos.",
  },
  {
    producer: "coopirane", category: FRUTAS, term: "tomatoes",
    nombre: "Tomate platense", unidad: "kg", precio: 2500,
    descripcion: "Tomates de huerta madurados en la planta: jugosos y con sabor de verdad. Sin agrotóxicos.",
  },
  {
    producer: "coopirane", category: ARTESANIAS, term: "palm basket",
    nombre: "Canasto de palma karanday", unidad: "unidad", precio: 18000,
    descripcion: "Canasto tejido a mano por las artesanas de la cooperativa con palma karanday. Resistente y de terminación prolija.",
  },
  {
    producer: "coopirane", category: ARTESANIAS, term: "woven textile",
    nombre: "Mantel tejido en telar", unidad: "unidad", precio: 25000,
    descripcion: "Mantel de algodón tejido en telar, con guardas de colores de la región. Pieza única hecha a mano.",
  },

  // --- Familia Bogado ---
  {
    producer: "bogado", category: PAN, term: "bread rolls",
    nombre: "Docena de chipá de almidón artesanal", unidad: "pack", precio: 5000,
    descripcion: "Chipá de almidón de mandioca y queso, horneado en horno de barro. Hecho en casa, crocante por fuera y tierno por dentro.",
  },
  {
    producer: "bogado", category: PAN, term: "cheese bread",
    nombre: "Chipá so'o (docena)", unidad: "pack", precio: 7500,
    descripcion: "Chipá relleno de carne y cebolla de verdeo, receta de la abuela. Se hornea el mismo día del pedido.",
  },
  {
    producer: "bogado", category: PAN, term: "flatbread",
    nombre: "Mbejú (bandeja de 6)", unidad: "pack", precio: 4500,
    descripcion: "Mbejú tradicional de almidón y queso, cocido en la plancha. Ideal para el mate de la tarde.",
  },
  {
    producer: "bogado", category: CONSERVAS, term: "jam jar",
    nombre: "Mermelada artesanal de mamón (frasco 450 g)", unidad: "unidad", precio: 4500,
    descripcion: "Mermelada de mamón de nuestro patio, cocida a fuego lento con poca azúcar. Hecha en casa, sin conservantes.",
  },
  {
    producer: "bogado", category: LACTEOS, term: "eggs",
    nombre: "Huevos caseros de gallinas libres (docena)", unidad: "pack", precio: 3800,
    descripcion: "Huevos de gallinas criadas sueltas, con yema anaranjada y sabor de campo. Sin agrotóxicos en su alimentación.",
  },
  {
    producer: "bogado", category: LACTEOS, term: "eggs",
    nombre: "Huevos caseros de gallinas libres (maple x 30)", unidad: "pack", precio: 9500,
    descripcion: "Maple de 30 huevos de campo, recolectados cada mañana. Ideal para panaderías y familias numerosas.",
  },

  // --- Huerta Los Abuelos ---
  {
    producer: "abuelos", category: CONSERVAS, term: "pickled eggplant",
    nombre: "Berenjenas en escabeche (frasco 350 g)", unidad: "unidad", precio: 4200,
    descripcion: "Berenjenas de nuestra huerta en escabeche casero con ajo y orégano. Hechas en tandas chicas, sin conservantes.",
  },
  {
    producer: "abuelos", category: CONSERVAS, term: "chili oil",
    nombre: "Ají picante en aceite (frasco 250 g)", unidad: "unidad", precio: 3800,
    descripcion: "Ají picante de la huerta macerado en aceite. Picor parejo y aroma fresco; hecho en casa.",
  },
  {
    producer: "abuelos", category: CONSERVAS, term: "pickled vegetables",
    nombre: "Zapallitos en escabeche (frasco 400 g)", unidad: "unidad", precio: 4000,
    descripcion: "Zapallitos verdes en escabeche suave, listos para el picoteo. Cultivo agroecológico y elaboración casera.",
  },
  {
    producer: "abuelos", category: FRUTAS, term: "lettuce",
    nombre: "Lechuga criolla (atado)", unidad: "unidad", precio: 1200,
    descripcion: "Lechuga criolla cosechada por la mañana, crocante y sin agrotóxicos. Se entrega fresca y recién cortada.",
  },
  {
    producer: "abuelos", category: FRUTAS, term: "red bell pepper",
    nombre: "Morrón rojo", unidad: "kg", precio: 3500,
    descripcion: "Morrones rojos de huerta, carnosos y dulces. Cultivados sin agrotóxicos.",
  },

  // --- Tambo La Querencia ---
  {
    producer: "querencia", category: LACTEOS, term: "cheese",
    nombre: "Queso criollo de campo", unidad: "kg", precio: 11500,
    descripcion: "Queso criollo de leche entera de nuestro rodeo, madurado en la propia quesería. Sabor firme y casero.",
  },
  {
    producer: "querencia", category: LACTEOS, term: "dulce de leche",
    nombre: "Dulce de leche de campo (frasco 500 g)", unidad: "unidad", precio: 5500,
    descripcion: "Dulce de leche cocido en olla de cobre, espeso y de color intenso. Hecho en casa, sin aditivos.",
  },
  {
    producer: "querencia", category: LACTEOS, term: "ricotta",
    nombre: "Ricota fresca (500 g)", unidad: "unidad", precio: 3800,
    descripcion: "Ricota fresca del día, suave y cremosa. Elaborada con el suero de nuestro queso criollo.",
  },
];
