import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/server/errors";
import { enforceRateLimit, handleRoute } from "@/server/http";
import { getBankAccountService, limiters } from "@/server/container";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new ServiceError("unauthorized", "Tenés que iniciar sesión");

    enforceRateLimit(limiters.bankAccount, user.id);

    const body = await req.json().catch(() => null);
    await getBankAccountService().save(user.id, body);
    return NextResponse.json({ ok: true });
  });
}
