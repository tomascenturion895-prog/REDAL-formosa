import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

import { getSpeechToText, limiters } from "@/server/container";
import { ServiceError } from "@/server/errors";
import { clientIp, enforceRateLimit, handleRoute } from "@/server/http";

const MAX_AUDIO_BYTES = 2 * 1024 * 1024;

// El grabador del navegador entrega WAV; Whisper deduce el formato por la extensión del nombre.
const EXTENSIONS: Record<string, string> = {
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
};

async function transcribeWithAssemblyAi(apiKey: string, audio: Blob): Promise<string> {
  const client = new AssemblyAI({ apiKey });
  // En cuentas gratuitas el token de streaming suele dar 404, así que se transcribe por REST estándar.
  const transcript = await client.transcripts.transcribe({
    audio: Buffer.from(await audio.arrayBuffer()),
    language_code: "es",
  });
  if (transcript.status === "error") {
    console.error("Error en transcripción AssemblyAI:", transcript.error);
    throw new ServiceError("unavailable", "No pudimos transcribir el audio. Probá de nuevo en un momento.");
  }
  return transcript.text ?? "";
}

/**
 * Búsqueda por voz del encabezado. Es pública (cualquiera puede buscar sin cuenta), pero cada
 * transcripción cuesta dinero: por eso se limita por IP y por tamaño, con cualquiera de los dos
 * proveedores. Con ASSEMBLYAI_API_KEY usa AssemblyAI; sin ella, el mismo Whisper que "Voz a Catálogo".
 */
export async function POST(req: Request) {
  return handleRoute(async () => {
    enforceRateLimit(limiters.voiceSearch, clientIp(req));

    const form = await req.formData().catch(() => null);
    const audio = form?.get("audio");
    if (!(audio instanceof Blob)) throw new ServiceError("bad_request", "No se proporcionó audio");
    if (audio.size > MAX_AUDIO_BYTES) throw new ServiceError("bad_request", "El audio es demasiado largo.");

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (apiKey) return NextResponse.json({ text: await transcribeWithAssemblyAi(apiKey, audio) });

    const extension = EXTENSIONS[audio.type.split(";")[0].trim().toLowerCase()] ?? "wav";
    return NextResponse.json({ text: await getSpeechToText().transcribe(audio, `audio.${extension}`) });
  });
}
