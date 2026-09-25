import { NextResponse, type NextRequest } from "next/server";

import { clientIp, enforceRateLimit, handleRoute } from "@/server/http";
import { getPaymentProcessor, limiters } from "@/server/container";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    enforceRateLimit(limiters.webhook, clientIp(req));

    const body = await req.json().catch(() => ({}));

    const result = await getPaymentProcessor().handle({
      type: body?.type,
      dataId: body?.data?.id ? String(body.data.id) : undefined,
      signature: req.headers.get("x-signature"),
      requestId: req.headers.get("x-request-id"),
    });

    return NextResponse.json(result);
  });
}
