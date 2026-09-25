"use client";

import { useEffect } from "react";
import Link from "next/link";

import { ErrorScreen } from "@/components/layout/error-screen";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col">
      <ErrorScreen
        illustration="error"
        code="Error 500"
        title="Se nos pinchó una rueda"
        description="Algo falló de nuestro lado. No es tu culpa: probá de nuevo y, si sigue, volvé en unos minutos."
        actions={
          <>
            <button type="button" onClick={reset} className="btn btn-primary !px-8 !py-3.5 !text-base">
              Reintentar
            </button>
            <Link href="/" className="btn btn-secondary !px-8 !py-3.5 !text-base">
              Volver al inicio
            </Link>
          </>
        }
      />
    </main>
  );
}
