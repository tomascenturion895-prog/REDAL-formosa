import type { MetadataRoute } from "next";

import { listPublicCatalogIds } from "@/lib/seo/public-catalog";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { productos, emprendimientos } = await listPublicCatalogIds();

  return [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/productos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/emprendimientos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/mapa`, changeFrequency: "weekly", priority: 0.5 },
    ...emprendimientos.map((e) => ({ url: `${siteUrl}/emprendimientos/${e.id}`, lastModified: e.updated_at, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...productos.map((p) => ({ url: `${siteUrl}/productos/${p.id}`, lastModified: p.updated_at, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
