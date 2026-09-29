import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emprendimientos",
  description: "Conocé a los emprendedores y productores de Formosa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
