import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/server/errors";
import { enforceRateLimit, handleRoute } from "@/server/http";
import { getBankAccountService, limiters } from "@/server/container";
import { logWarn } from "@/server/logger";

/** Cuenta bancaria (descifrada) de un emprendimiento, para que el administrador le transfiera. Solo admin. */
export async function GET(req: NextRequest) {
  return handleRoute(async () => {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new ServiceError("unauthorized", "Tenés que iniciar sesión");

    const { data: isAdmin } = await db.rpc("is_admin");
    if (!isAdmin) throw new ServiceError("forbidden", "Solo un administrador puede ver esto");

    enforceRateLimit(limiters.bankAccount, user.id);

    const emprendimientoId = req.nextUrl.searchParams.get("emprendimientoId");
    if (!emprendimientoId) throw new ServiceError("bad_request", "Falta el emprendimiento");

    const { data: store } = await db.from("emprendimientos").select("owner_id").eq("id", emprendimientoId).maybeSingle();
    if (!store) throw new ServiceError("not_found", "Emprendimiento no encontrado");

    const account = await getBankAccountService().load(store.owner_id);
    if (!account) throw new ServiceError("not_found", "Este vendedor todavía no cargó su cuenta bancaria.");

    // Rastro de quién vio una cuenta bancaria (sin el CBU).
    logWarn(`Auditoría: el administrador ${user.id} consultó la cuenta de cobro del emprendimiento ${emprendimientoId}`);
    return NextResponse.json({ account });
  });
}
