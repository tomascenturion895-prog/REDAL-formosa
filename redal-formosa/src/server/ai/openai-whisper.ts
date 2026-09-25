import type { SpeechToText } from "./ports";
import { openAiJson } from "./openai-http";

/** Adaptador de Whisper (OpenAI) para el puerto SpeechToText. */
export class OpenAiWhisper implements SpeechToText {
  constructor(private readonly apiKey: string | undefined) {}

  async transcribe(audio: Blob, filename: string): Promise<string> {
    const form = new FormData();
    form.append("file", audio, filename);
    form.append("model", "whisper-1");
    form.append("language", "es");
    form.append("temperature", "0");
    // Sesga el reconocimiento hacia el vocabulario esperado (precios, kilos, verduras).
    form.append("prompt", "Vendedor de Formosa, Argentina: producto, cantidad, kilos, pesos, precio.");

    const { text } = await openAiJson<{ text?: string }>(this.apiKey, "/audio/transcriptions", { body: form });
    return (text ?? "").trim();
  }
}
