import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/server/errors";
import { enforceRateLimit, handleRoute } from "@/server/http";
import { getGeocoder, limiters } from "@/server/container";

// GET /api/geocode?q=<dirección>: solo con sesión. Devuelve hasta 4 ubicaciones posibles en Formosa.
export async function GET(req: NextRequest) {
  return handleRoute(async () => {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new ServiceError("unauthorized", "Tenés que iniciar sesión");

    enforceRateLimit(limiters.geocode, user.id);
    enforceRateLimit(limiters.geocodeGlobal, "global");

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length < 4 || q.length > 200) throw new ServiceError("bad_request", "Escribí la dirección con calle y número.");

    return NextResponse.json({ results: await getGeocoder().search(q) });
  });
}
