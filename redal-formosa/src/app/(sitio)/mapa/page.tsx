"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { MapSkeleton } from "@/components/ui/skeleton";
import { ProducersMapView } from "@/components/map/producers-map-view";

function MapContent() {
  const selected = useSearchParams().get("punto");
  return <ProducersMapView initialSelectedId={selected} />;
}

export default function MapaPage() {
  return (
    <div className="page-container py-8">
      <PageHeader title="Mapa de emprendimientos" description="Encontrá quién produce cerca tuyo y cómo llegar." />
      <Suspense fallback={<MapSkeleton />}>
        <MapContent />
      </Suspense>
    </div>
  );
}
