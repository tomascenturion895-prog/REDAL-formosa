import { ServiceError } from "../errors";

// Por defecto habla con OpenAI. Con OPENAI_BASE_URL sirve cualquier proveedor con API compatible
// (por ejemplo Groq: https://api.groq.com/openai/v1, con capa gratuita).
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_CHAT_MODEL = "gpt-4o-mini";
const DEFAULT_TRANSCRIBE_MODEL = "whisper-1";

const baseUrl = () => (process.env.OPENAI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "");
const isOpenAi = () => baseUrl() === DEFAULT_BASE_URL;

export const chatModel = () => process.env.OPENAI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
export const transcribeModel = () => process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || DEFAULT_TRANSCRIBE_MODEL;

/** Traduce los fallos del proveedor de IA a errores esperables, sin filtrar detalles internos. */
export async function openAiJson<T>(
  apiKey: string | undefined,
  path: string,
  init: { body: BodyInit; headers?: Record<string, string> },
): Promise<T> {
  if (!apiKey) throw new ServiceError("unavailable", "Las herramientas con IA todavía no están habilitadas.");

  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, ...init.headers },
      body: init.body,
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new ServiceError("unavailable", "No pudimos comunicarnos con el servicio de IA. Probá de nuevo.");
  }

  if (!response.ok) {
    console.error("El servicio de IA respondió", response.status, await response.text().catch(() => ""));
    if (response.status === 429) throw new ServiceError("unavailable", "El servicio de IA está saturado. Probá en un momento.");
    throw new ServiceError("unavailable", "El servicio de IA no pudo procesar el pedido.");
  }
  return (await response.json()) as T;
}

interface ChatResponse {
  choices?: { message?: { content?: string | null } }[];
}

interface JsonChat {
  apiKey: string | undefined;
  system: string;
  user: string;
  temperature: number;
  /** Esquema JSON de la respuesta esperada. */
  schema: { name: string; schema: Record<string, unknown> };
}

/**
 * Pide una respuesta JSON. Con OpenAI usa salida estructurada estricta; en otros proveedores usa el modo
 * JSON y pega el esquema en el prompt. En ambos casos la respuesta se valida después, sin confiar en su forma.
 */
export async function chatJson({ apiKey, system, user, temperature, schema }: JsonChat): Promise<unknown> {
  const strict = isOpenAi();
  const data = await openAiJson<ChatResponse>(apiKey, "/chat/completions", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: chatModel(),
      temperature,
      response_format: strict ? { type: "json_schema", json_schema: { ...schema, strict: true } } : { type: "json_object" },
      messages: [
        { role: "system", content: strict ? system : `${system}\n\nRespondé SOLO con un objeto JSON que cumpla este esquema:\n${JSON.stringify(schema.schema)}` },
        { role: "user", content: user },
      ],
    }),
  });

  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
