import type { Metadata } from "next";

const siteName = "RedAL Formosa";
const description = "Comprale directo a emprendedores y productores de Formosa, y recibí tu pedido en casa.";

// El dominio sale de la configuración: nunca un valor inventado en el código.
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description,
  applicationName: siteName,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName,
    title: siteName,
    description,
  },
  twitter: { card: "summary", title: siteName, description },
  formatDetection: { email: false, telephone: false },
};
