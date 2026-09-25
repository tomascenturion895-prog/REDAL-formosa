import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/server/errors";
import { enforceRateLimit, handleRoute } from "@/server/http";
import { requireRole } from "@/server/auth/roles";
import { getVoiceCatalogService, limiters } from "@/server/container";

// Solo VENDEDOR (o ADMIN): recibe un audio (campo "audio") y devuelve la transcripción y el borrador.
export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const db = await createClient();
    const { userId } = await requireRole(db, ["VENDEDOR", "ADMIN"]);
    enforceRateLimit(limiters.voiceCatalog, userId);

    const form = await req.formData().catch(() => null);
    const audio = form?.get("audio");
    if (!(audio instanceof Blob)) throw new ServiceError("bad_request", "Falta el audio.");

    const result = await getVoiceCatalogService().fromAudio(audio);
    return NextResponse.json(result);
  });
}
