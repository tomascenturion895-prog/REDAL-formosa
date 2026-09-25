import { ServiceError } from "../errors";

export const OPENAI_URL = "https://api.openai.com/v1";

/** Traduce los fallos de OpenAI a errores esperables, sin filtrar detalles internos. */
export async function openAiJson<T>(
  apiKey: string | undefined,
  path: string,
  init: { body: BodyInit; headers?: Record<string, string> },
): Promise<T> {
  if (!apiKey) throw new ServiceError("unavailable", "Las herramientas con IA todavía no están habilitadas.");

  let response: Response;
  try {
    response = await fetch(`${OPENAI_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, ...init.headers },
      body: init.body,
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new ServiceError("unavailable", "No pudimos comunicarnos con el servicio de IA. Probá de nuevo.");
  }

  if (!response.ok) {
    console.error("OpenAI respondió", response.status, await response.text().catch(() => ""));
    if (response.status === 429) throw new ServiceError("unavailable", "El servicio de IA está saturado. Probá en un momento.");
    throw new ServiceError("unavailable", "El servicio de IA no pudo procesar el pedido.");
  }
  return (await response.json()) as T;
}
