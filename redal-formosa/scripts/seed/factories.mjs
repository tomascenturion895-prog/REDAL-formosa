// Factories: convierten las definiciones de data.mjs en filas listas para insertar, con las mismas
// reglas que la base (unidades válidas, precios enteros, slugs únicos). Sin acceso a la base.
import { SEED_EMAIL_DOMAIN } from "./data.mjs";

export const VALID_UNITS = ["unidad", "kg", "litro", "metro", "pack"];

export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Ruta dentro del bucket product-images donde el seeder sube la foto de cada producto. */
export const imageStoragePath = (imagen) => `seed/${imagen}.jpg`;

export const seedEmail = (prefix, key) => `${prefix}.${key}@${SEED_EMAIL_DOMAIN}`;

export function customerFactory(def) {
  return { email: seedEmail("cliente", def.key), fullName: def.nombre, role: "comprador" };
}

export function producerUserFactory(def) {
  return { email: seedEmail("productor", def.key), fullName: def.owner, role: "emprendedor" };
}

export function categoryFactory(def) {
  return { nombre: def.nombre, slug: slugify(def.nombre) };
}

export function emprendimientoFactory(def, ownerId) {
  return {
    owner_id: ownerId,
    nombre: def.nombre,
    descripcion: def.descripcion,
    telefono: def.telefono,
    email: seedEmail("contacto", def.key),
    direccion: def.direccion,
    latitud: def.latitud,
    longitud: def.longitud,
    horario_apertura: "08:00",
    horario_cierre: "18:00",
    activo: true,
  };
}

export function productFactory(def, { emprendimientoId, categoriaId, imageUrl }) {
  if (!VALID_UNITS.includes(def.unidad)) throw new Error(`Unidad inválida en "${def.nombre}": ${def.unidad}`);
  if (!Number.isInteger(def.precio) || def.precio <= 0) throw new Error(`Precio inválido en "${def.nombre}": ${def.precio}`);
  return {
    emprendimiento_id: emprendimientoId,
    categoria_id: categoriaId,
    nombre: def.nombre,
    descripcion: def.descripcion,
    precio: def.precio,
    unidad: def.unidad,
    imagen_url: imageUrl,
    disponible: true,
    // Los productos de prueba entran ya aprobados; los reales los aprueba un administrador.
    validado: true,
  };
}
