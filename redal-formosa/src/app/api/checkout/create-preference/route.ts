import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/server/errors";
import { enforceRateLimit, handleRoute } from "@/server/http";
import { getCheckoutService, limiters } from "@/server/container";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new ServiceError("unauthorized", "Tenés que iniciar sesión");

    enforceRateLimit(limiters.checkout, user.id);

    const { pedidoId } = await req.json().catch(() => ({}));
    if (typeof pedidoId !== "string" || !pedidoId) throw new ServiceError("bad_request", "Falta el pedido a pagar");

    const session = await getCheckoutService().createSession(db, user.id, pedidoId);
    return NextResponse.json({ url: session.url });
  });
}
