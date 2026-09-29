import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness: responde si el proceso está en pie. No consulta dependencias externas. */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
