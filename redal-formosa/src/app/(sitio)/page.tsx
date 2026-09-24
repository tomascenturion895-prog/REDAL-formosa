"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { PageHeader } from "@/components/layout/page-header";
import { RecommendationsCarousel } from "@/components/recommendations/recommendations-carousel";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container py-section space-y-12">
      <PageHeader
        title="Lo que se produce en Formosa, cerca tuyo"
        description="Encontrá productos y servicios de emprendedores locales y contactalos directamente."
      />

      {/* Recomendaciones personalizadas */}
      {user && (
        <RecommendationsCarousel
          title="✨ Para ti"
          userId={user.id}
          type="personalized"
          limit={8}
        />
      )}

      {/* Productos trending */}
      <RecommendationsCarousel
        title="🔥 Trending"
        type="trending"
        limit={8}
      />

      {/* Productos nuevos */}
      <RecommendationsCarousel
        title="✨ Nuevos"
        type="new"
        limit={8}
      />
    </div>
  );
}
