import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";

import { Suspense } from "react";

import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { defaultMetadata } from "@/lib/seo/metadata";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { PWAInstaller } from "@/components/pwa/pwa-installer";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// next/font descarga y sirve las fuentes desde el propio dominio: no hace falta preconectar a Google.
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"], display: "swap" });

// Aplica el tema guardado antes del primer pintado para evitar el destello claro/oscuro.
const themeScript = `try{var t=localStorage.getItem("redal-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a13" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
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
