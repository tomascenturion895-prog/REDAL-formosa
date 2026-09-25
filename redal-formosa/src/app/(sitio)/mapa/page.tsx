"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProducersMapView } from "@/components/map/producers-map-view";

function MapContent() {
  const selected = useSearchParams().get("punto");
  return <ProducersMapView initialSelectedId={selected} />;
}

export default function MapaPage() {
  return (
    <div className="page-container py-8">
      <PageHeader title="Mapa de emprendimientos" description="Encontrá quién produce cerca tuyo y cómo llegar." />
      <Suspense fallback={<div className="h-[34rem]" aria-busy="true" />}>
        <MapContent />
      </Suspense>
    </div>
  );
}
