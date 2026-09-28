export const NOVEDAD_MAX_CHARS = 500;

/** Recorta y valida el texto de una novedad; el mismo límite que la restricción de la tabla. */
export function cleanNovedad(text: string): string {
  const clean = text.trim();
  if (!clean) throw new Error("Escribí o dictá algo para publicar");
  if (clean.length > NOVEDAD_MAX_CHARS) throw new Error(`Máximo ${NOVEDAD_MAX_CHARS} caracteres`);
  return clean;
}
