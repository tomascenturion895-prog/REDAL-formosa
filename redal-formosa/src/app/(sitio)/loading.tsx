import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

// Se muestra al instante mientras carga cualquier sección del sitio que no tenga su propio esqueleto.
export default function Loading() {
  return (
    <div className="page-container py-8" role="status" aria-busy="true" aria-label="Cargando">
      <PageHeaderSkeleton />
      <ProductGridSkeleton count={4} />
    </div>
  );
}
