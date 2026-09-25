import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY no está configurada en el entorno." },
      { status: 500 }
    );
  }

  try {
    const client = new AssemblyAI({
      apiKey: apiKey
    });
    
    // Generar un token temporal válido por 10 minutos (600 segundos)
    const token = await client.realtime.createTemporaryToken({ expires_in: 600 });

    return NextResponse.json({ token: token });
  } catch (error: any) {
    console.error("Error fetching AssemblyAI token:", error);
    return NextResponse.json(
      { error: "Error al obtener token de AssemblyAI", details: error.message || error },
      { status: 500 }
    );
  }
}
