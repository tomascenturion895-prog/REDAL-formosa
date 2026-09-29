import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa de emprendedores",
  description: "Encontrá emprendimientos cerca tuyo en el mapa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
