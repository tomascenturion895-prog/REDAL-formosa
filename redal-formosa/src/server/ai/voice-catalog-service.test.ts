import { describe, expect, it, vi } from "vitest";

import { ServiceError } from "../errors";
import type { ProductExtractor, SpeechToText } from "./ports";
import { VoiceCatalogService } from "./voice-catalog-service";

const audio = (type = "audio/webm;codecs=opus", size = 4096) => new Blob([new Uint8Array(size)], { type });
const draft = { producto: "Zapallo", cantidad: 10, precio: 1000, unidad: "kg" as const };

function setup(transcript = "Tengo 10 kilos de zapallo a 1000 pesos", extracted: typeof draft | null = draft) {
  const speech: SpeechToText = { transcribe: vi.fn().mockResolvedValue(transcript) };
  const extractor: ProductExtractor = { extract: vi.fn().mockResolvedValue(extracted) };
  return { speech, extractor, service: new VoiceCatalogService(speech, extractor) };
}

describe("VoiceCatalogService", () => {
  it("transcribe y devuelve el borrador", async () => {
    const { service, speech, extractor } = setup();
    const result = await service.fromAudio(audio());
    expect(result).toEqual({ transcript: "Tengo 10 kilos de zapallo a 1000 pesos", draft });
    expect(speech.transcribe).toHaveBeenCalledWith(expect.any(Blob), "voz.webm");
    expect(extractor.extract).toHaveBeenCalledWith("Tengo 10 kilos de zapallo a 1000 pesos");
  });

  it("rechaza formatos que no son audio soportado", async () => {
    const { service, speech } = setup();
    await expect(service.fromAudio(audio("application/pdf"))).rejects.toMatchObject({ code: "bad_request" });
    expect(speech.transcribe).not.toHaveBeenCalled();
  });

  it("rechaza audios demasiado grandes o vacíos sin llamar a la IA", async () => {
    const { service, speech } = setup();
    await expect(service.fromAudio(audio("audio/webm", 6 * 1024 * 1024))).rejects.toBeInstanceOf(ServiceError);
    await expect(service.fromAudio(audio("audio/webm", 10))).rejects.toBeInstanceOf(ServiceError);
    expect(speech.transcribe).not.toHaveBeenCalled();
  });

  it("falla con mensaje claro si no se entiende el audio", async () => {
    const { service, extractor } = setup("");
    await expect(service.fromAudio(audio())).rejects.toThrow(/entender el audio/);
    expect(extractor.extract).not.toHaveBeenCalled();
  });

  it("falla con mensaje claro si no hay producto", async () => {
    const { service } = setup("hola, ¿cómo andan?", null);
    await expect(service.fromAudio(audio())).rejects.toThrow(/ningún producto/);
  });
});
