import { siteName } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-section border-t border-border bg-surface">
      <div className="page-container flex flex-col gap-1 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display font-semibold text-foreground">{siteName}</p>
        <p>Productos y servicios de emprendedores de Formosa.</p>
      </div>
    </footer>
  );
}
