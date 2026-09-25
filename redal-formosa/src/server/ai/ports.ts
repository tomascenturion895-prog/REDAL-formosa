import type { VoiceProductDraft } from "@/lib/domain/voice-product";

/** Audio → texto. */
export interface SpeechToText {
  transcribe(audio: Blob, filename: string): Promise<string>;
}

/** Texto libre → borrador de producto (null si no se puede identificar un producto). */
export interface ProductExtractor {
  extract(transcript: string): Promise<VoiceProductDraft | null>;
}
