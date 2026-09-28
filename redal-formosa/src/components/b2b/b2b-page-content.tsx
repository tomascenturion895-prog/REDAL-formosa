"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { b2bRepository } from "@/lib/b2b/b2b-repository";
import { useAsync } from "@/lib/hooks/use-async";
import { B2BIntro } from "./b2b-intro";
import { B2BMyRequests } from "./b2b-my-requests";
import { B2BRequestForm } from "./b2b-request-form";

/** Contenido interactivo de /b2b: formulario + solicitudes propias. */
export function B2BPageContent() {
  const { user } = useAuth();
  const { data: mine, reload } = useAsync(() => b2bRepository.mine(), [user?.id], { enabled: Boolean(user), scope: user?.id });

  return (
    <div className="page-container space-y-10 py-section">
      <B2BIntro />
      <B2BMyRequests requests={mine ?? []} onChanged={reload} />
      <section id="solicitar-cotizacion" aria-labelledby="solicitar-title" className="space-y-4">
        <h2 id="solicitar-title" className="text-heading">
          Pedí tu cotización
        </h2>
        <B2BRequestForm onCreated={reload} />
      </section>
      <p className="text-center text-sm text-muted">
        ¿Preferís comprar de a poco?{" "}
        <Link href="/emprendimientos" className="font-semibold text-link hover:underline">
          Recorré los emprendimientos
        </Link>
        .
      </p>
    </div>
  );
}
