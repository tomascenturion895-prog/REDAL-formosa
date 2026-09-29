import { SkipLink } from "@/components/layout/skip-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
