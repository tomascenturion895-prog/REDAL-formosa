import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/** Origen de Supabase (https y wss) para permitir auth, REST y realtime desde el navegador. */
function supabaseOrigins(): string[] {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const ws = url.protocol === "https:" ? "wss:" : "ws:";
    return [url.origin, `${ws}//${url.host}`];
  } catch {
    return [];
  }
}

/**
 * Política de contenido. Next inyecta scripts y estilos en línea, por eso se permite 'unsafe-inline'
 * (la variante con nonce obliga a renderizado dinámico en todo el sitio). El resto se restringe al
 * propio origen, a Supabase y a las imágenes/tiles de mapas.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigins().join(" ")}${isProd ? "" : " ws: http://127.0.0.1:54321 http://localhost:54321"}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Solo en desarrollo: permite optimizar imágenes del Supabase local (127.0.0.1).
    dangerouslyAllowLocalIP: !isProd,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/**" },
      { protocol: "http", hostname: "localhost", port: "54321", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Las respuestas de la API nunca deben quedar en cachés compartidas.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Geolocalización: seguimiento de entregas. Micrófono: "Voz a Catálogo". La cámara no se usa.
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
