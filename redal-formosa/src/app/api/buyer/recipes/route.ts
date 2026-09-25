import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/server/errors";
import { enforceRateLimit, handleRoute } from "@/server/http";
import { getRecipesService, limiters } from "@/server/container";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/buyer/recipes { emprendimientoId, productIds? }: cualquier persona con sesión.
export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new ServiceError("unauthorized", "Tenés que iniciar sesión");

    enforceRateLimit(limiters.recipes, user.id);

    const body = (await req.json().catch(() => null)) as { emprendimientoId?: unknown; productIds?: unknown } | null;
    const emprendimientoId = body?.emprendimientoId;
    if (typeof emprendimientoId !== "string" || !UUID.test(emprendimientoId)) {
      throw new ServiceError("bad_request", "Falta el emprendimiento.");
    }
    const productIds = Array.isArray(body?.productIds)
      ? body.productIds.filter((id): id is string => typeof id === "string" && UUID.test(id)).slice(0, 20)
      : undefined;

    return NextResponse.json(await getRecipesService().suggest(db, emprendimientoId, productIds));
  });
}
