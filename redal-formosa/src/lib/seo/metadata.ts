import { Metadata } from "next";

export const siteConfig = {
  name: "RedAL Formosa",
  description: "Encuentra productos y servicios de emprendedores locales en Formosa. Compra directamente de productores locales con envío rápido.",
  url: "https://redal-formosa.com",
  ogImage: "https://redal-formosa.com/og-image.jpg",
  links: {
    twitter: "https://twitter.com/redalformosa",
    instagram: "https://instagram.com/redalformosa",
  },
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "productos locales",
    "Formosa",
    "emprendedores",
    "comercio local",
    "compra online",
    "envío",
  ],
  authors: [{ name: "RedAL Formosa", url: siteConfig.url }],
  creator: "RedAL Formosa",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@redalformosa",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  formatDetection: {
    email: false,
    telephone: false,
  },
};

export function generateProductMetadata(product: {
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_principal?: string;
}): Metadata {
  return {
    title: product.nombre,
    description:
      product.descripcion || `Compra ${product.nombre} en RedAL Formosa - $${product.precio}`,
    openGraph: {
      type: "article",
      title: product.nombre,
      description:
        product.descripcion || `Compra ${product.nombre} en RedAL Formosa`,
      images: product.imagen_principal ? [product.imagen_principal] : [],
    },
  };
}
