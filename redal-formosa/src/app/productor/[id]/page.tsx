import { permanentRedirect } from "next/navigation";

interface ProductorPageProps {
  params: Promise<{ id: string }>;
}

// Ruta heredada del primer prototipo (mostraba datos estáticos que se quitaron). El perfil público
// real vive en /emprendimientos/[id]; esto conserva los enlaces viejos apuntando ahí.
export default async function ProductorRedirect({ params }: ProductorPageProps) {
  const { id } = await params;
  permanentRedirect(`/emprendimientos/${encodeURIComponent(id)}`);
}
