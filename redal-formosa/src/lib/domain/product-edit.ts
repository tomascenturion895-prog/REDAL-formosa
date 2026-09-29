/** Lo que el vendedor puede cambiar de un producto ya cargado. */
export interface ProductContent {
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
}

const norm = (value: string | null | undefined) => (value ?? "").trim();

/**
 * La base devuelve un producto a revisión cuando cambia lo que el comprador lee o ve (nombre, descripción,
 * foto). Precio, unidad y disponibilidad se cambian sin revisión. Esta regla solo sirve para avisarlo en pantalla;
 * quien la impone es el trigger protect_product_validation.
 */
export function editSendsToReview(before: ProductContent, after: ProductContent): boolean {
  return (
    norm(before.nombre) !== norm(after.nombre) ||
    norm(before.descripcion) !== norm(after.descripcion) ||
    norm(before.imagen_url) !== norm(after.imagen_url)
  );
}
