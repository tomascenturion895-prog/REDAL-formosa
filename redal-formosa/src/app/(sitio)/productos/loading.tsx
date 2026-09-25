import { PageHeaderSkeleton, ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="page-container py-8" role="status" aria-busy="true" aria-label="Cargando productos">
      <PageHeaderSkeleton />
      <Skeleton className="mb-6 h-12" />
      <ProductGridSkeleton />
    </div>
  );
}
