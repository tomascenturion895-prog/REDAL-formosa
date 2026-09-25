import type { Metadata } from "next";
import Link from "next/link";

import { ErrorScreen } from "@/components/layout/error-screen";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <ErrorScreen
          illustration="road"
          code="Error 404"
          title="Te fuiste por un camino de tierra"
          description="Esta página no existe o cambió de lugar. Volvamos a la ruta principal, donde te esperan los productos de Formosa."
          actions={
            <>
              <Link href="/" className="btn btn-primary !px-8 !py-3.5 !text-base">
                Volver al inicio
              </Link>
              <Link href="/productos" className="btn btn-secondary !px-8 !py-3.5 !text-base">
                Ver productos
              </Link>
            </>
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
