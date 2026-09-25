import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { defaultMetadata } from "@/lib/seo/metadata";
import { PWAInstaller } from "@/components/pwa/pwa-installer";
import "./globals.css";

// next/font descarga y sirve las fuentes desde el propio dominio: no hace falta preconectar a Google.
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1211" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${figtree.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <CartProvider>
            {children}
            <PWAInstaller />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
