import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REDAL Formosa — Oferta Productiva Local",
  description: "Red de Emprendimientos y Desarrollo de Abastecimiento Local de la Provincia de Formosa, Argentina.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
