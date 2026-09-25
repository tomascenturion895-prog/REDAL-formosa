import { MapSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="page-container py-8" role="status" aria-busy="true" aria-label="Cargando el mapa">
      <PageHeaderSkeleton />
      <MapSkeleton />
    </div>
  );
}
