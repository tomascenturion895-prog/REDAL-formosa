import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { MercadoPagoBadge } from "@/components/payment/mercadopago-badge";
import { siteTagline } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-container grid gap-8 py-10 text-sm sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-muted">
            {siteTagline}: lo que producen los emprendedores de Formosa, directo a tu casa.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            Pagos procesados por <MercadoPagoBadge size="sm" />
          </p>
        </div>
        <nav aria-label="Comprar" className="flex flex-col gap-2">
          <p className="font-semibold text-foreground">Comprar</p>
          <Link href="/productos" className="text-muted hover:text-foreground">
            Productos
          </Link>
          <Link href="/emprendimientos" className="text-muted hover:text-foreground">
            Emprendimientos
          </Link>
          <Link href="/mapa" className="text-muted hover:text-foreground">
            Mapa
          </Link>
          <Link href="/mis-pedidos" className="text-muted hover:text-foreground">
            Mis pedidos
          </Link>
        </nav>
        <nav aria-label="Vender" className="flex flex-col gap-2">
          <p className="font-semibold text-foreground">Vender</p>
          <Link href="/register?next=/setup" className="text-muted hover:text-foreground">
            Sumá tu emprendimiento
          </Link>
          <Link href="/dashboard" className="text-muted hover:text-foreground">
            Panel del productor
          </Link>
        </nav>
      </div>
    </footer>
  );
}
