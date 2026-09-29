import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Zonas privadas o sin contenido para buscadores.
      disallow: ["/api/", "/admin", "/dashboard", "/setup", "/checkout", "/carrito", "/mis-pedidos", "/tracking", "/confirmacion", "/favoritos", "/configuracion", "/auth/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
