import type { Metadata } from "next";

import { getPublicEmprendimiento, snippet } from "@/lib/seo/public-catalog";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const emprendimiento = await getPublicEmprendimiento(id);
  if (!emprendimiento) return { title: "Emprendimiento" };

  const description = snippet(emprendimiento.descripcion, `Conocé ${emprendimiento.nombre} y sus productos en RedAL Formosa.`);
  return {
    title: emprendimiento.nombre,
    description,
    alternates: { canonical: `/emprendimientos/${emprendimiento.id}` },
    openGraph: { title: emprendimiento.nombre, description },
  };
}

export default function EmprendimientoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
