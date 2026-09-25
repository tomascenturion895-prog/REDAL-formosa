import { redirect } from "next/navigation";

// La búsqueda vive en el catálogo; se mantiene la ruta para enlaces viejos.
export default async function BuscarPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  redirect(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
}
