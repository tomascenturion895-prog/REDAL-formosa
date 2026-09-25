import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

export async function POST(req: Request) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY no está configurada en el entorno." },
      { status: 500 }
    );
  }

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
      speech_model: "nano", // Modelo optimizado para mayor velocidad
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
