import type { Metadata } from "next";

// Pantalla privada: el título ayuda a distinguir pestañas y no se indexa.
export const metadata: Metadata = {
  title: "Mis cobros",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
