import type { Metadata } from "next";

import { B2BPageContent } from "@/components/b2b/b2b-page-content";

export const metadata: Metadata = {
  title: "Compras mayoristas",
  description: "Pedí cotización por volumen a productores de Formosa: restaurantes, verdulerías, hoteles y comedores.",
};

export default function B2BPage() {
  return <B2BPageContent />;
}
