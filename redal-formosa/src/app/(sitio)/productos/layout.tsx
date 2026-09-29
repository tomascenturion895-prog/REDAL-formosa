import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos",
  description: "Productos artesanales y de la tierra, directo de emprendedores de Formosa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
