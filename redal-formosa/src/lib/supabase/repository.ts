import type { PostgrestError } from "@supabase/supabase-js";

/** Fallo de acceso a datos. Los repositorios lo lanzan en vez de devolver listas vacías. */
export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly cause?: PostgrestError | Error | null,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

// La respuesta de Supabase es una unión discriminada: o hay dato (error: null) o hay error.
// Se tipa por la forma de la respuesta y se extrae el dato del caso exitoso; inferir un
// genérico a través de esa unión hace que TypeScript colapse a never/unknown.
interface AnyResponse {
  data: unknown;
  error: PostgrestError | null;
}
type DataOf<R extends AnyResponse> = Extract<R, { error: null }>["data"];

/**
 * Ejecuta una consulta y devuelve su dato, o lanza RepositoryError.
 * Devolver [] ante un error escondió durante semanas migraciones sin aplicar.
 * Recibe la consulta sin await: los builders de Supabase son PromiseLike.
 */
export async function unwrap<R extends AnyResponse>(query: PromiseLike<R>, context: string): Promise<DataOf<R>> {
  const result = await query;
  if (result.error) throw new RepositoryError(`${context}: ${result.error.message}`, result.error);
  return result.data as DataOf<R>;
}

/** Para consultas maybeSingle(): "no hay fila" es un resultado válido (null), un error no. */
export async function unwrapOptional<R extends AnyResponse>(
  query: PromiseLike<R>,
  context: string,
): Promise<NonNullable<DataOf<R>> | null> {
  return ((await unwrap(query, context)) ?? null) as NonNullable<DataOf<R>> | null;
}
