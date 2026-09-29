import type { Metadata } from "next";

import { getPublicProduct, snippet } from "@/lib/seo/public-catalog";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const producto = await getPublicProduct(id);
  if (!producto) return { title: "Producto" };

  const description = snippet(producto.descripcion, `${producto.nombre}, de emprendedores de Formosa, en RedAL Formosa.`);
  return {
    title: producto.nombre,
    description,
    alternates: { canonical: `/productos/${producto.id}` },
    openGraph: { title: producto.nombre, description, images: producto.imagen_url ? [producto.imagen_url] : undefined },
  };
}

export default function ProductoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
