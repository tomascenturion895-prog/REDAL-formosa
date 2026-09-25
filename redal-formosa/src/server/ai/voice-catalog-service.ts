import type { VoiceProductDraft } from "@/lib/domain/voice-product";
import { ServiceError } from "../errors";
import type { ProductExtractor, SpeechToText } from "./ports";

export const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const MIN_AUDIO_BYTES = 1024;

export interface VoiceCatalogResult {
  transcript: string;
  draft: VoiceProductDraft;
}

const EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
};

/** "Voz a Catálogo": audio del vendedor → transcripción → borrador de producto. */
export class VoiceCatalogService {
  constructor(
    private readonly speech: SpeechToText,
    private readonly extractor: ProductExtractor,
  ) {}

  async fromAudio(audio: Blob): Promise<VoiceCatalogResult> {
    const baseType = audio.type.split(";")[0].trim().toLowerCase();
    const extension = EXTENSIONS[baseType];
    if (!extension) throw new ServiceError("bad_request", "El formato de audio no es compatible.");
    if (audio.size > MAX_AUDIO_BYTES) throw new ServiceError("bad_request", "El audio es demasiado largo. Grabá un mensaje más corto.");
    if (audio.size < MIN_AUDIO_BYTES) throw new ServiceError("bad_request", "No se escuchó nada. Probá grabar de nuevo.");

    const transcript = await this.speech.transcribe(audio, `voz.${extension}`);
    if (!transcript) throw new ServiceError("bad_request", "No pudimos entender el audio. Probá hablar más cerca del micrófono.");

    const draft = await this.extractor.extract(transcript);
    if (!draft) {
      throw new ServiceError("bad_request", "No identificamos ningún producto. Decí, por ejemplo: «Tengo 10 kilos de zapallo a 1000 pesos».");
    }
    return { transcript, draft };
  }
}
