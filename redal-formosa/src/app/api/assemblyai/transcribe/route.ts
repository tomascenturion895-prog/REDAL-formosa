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

/** Sin clave de AssemblyAI, la búsqueda por voz usa el mismo Whisper que "Voz a Catálogo" (OPENAI_API_KEY). */
async function transcribeWithWhisper(req: Request) {
  return handleRoute(async () => {
    enforceRateLimit(limiters.voiceSearch, clientIp(req));

    const form = await req.formData().catch(() => null);
    const audio = form?.get("audio");
    if (!(audio instanceof Blob)) throw new ServiceError("bad_request", "No se proporcionó audio");
    if (audio.size > MAX_AUDIO_BYTES) throw new ServiceError("bad_request", "El audio es demasiado largo.");

    const extension = EXTENSIONS[audio.type.split(";")[0].trim().toLowerCase()] ?? "wav";
    const text = await getSpeechToText().transcribe(audio, `audio.${extension}`);
    return NextResponse.json({ text });
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) return transcribeWithWhisper(req);

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No se proporcionó audio" }, { status: 400 });
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const client = new AssemblyAI({ apiKey });

    // En cuentas gratuitas el token de streaming suele dar 404, así que hacemos
    // la transcripción por REST estándar que funciona para todos.
    const transcript = await client.transcripts.transcribe({
      audio: buffer,
      language_code: "es", // Español
    });

    if (transcript.status === "error") {
      throw new Error(transcript.error);
    }

    return NextResponse.json({ text: transcript.text });
  } catch (error: any) {
    console.error("Error en transcripción AssemblyAI:", error);
    return NextResponse.json(
      { error: "Error al procesar el audio", details: error.message || error },
      { status: 500 }
    );
  }
}
