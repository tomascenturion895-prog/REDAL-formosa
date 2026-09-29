import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";

export interface PublicProduct {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
}

export interface PublicEmprendimiento {
  id: string;
  nombre: string;
  descripcion: string | null;
}

/** Lecturas del catálogo para SEO. Nunca lanzan: si falla la consulta, la página igual se muestra sin metadatos propios. */
export const getPublicProduct = cache(async (id: string): Promise<PublicProduct | null> => {
  try {
    const { data } = await createPublicClient()
      .from("productos")
      .select("id, nombre, descripcion, imagen_url")
      .eq("id", id)
      .eq("disponible", true)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
});

export const getPublicEmprendimiento = cache(async (id: string): Promise<PublicEmprendimiento | null> => {
  try {
    const { data } = await createPublicClient()
      .from("emprendimientos")
      .select("id, nombre, descripcion")
      .eq("id", id)
      .eq("activo", true)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
});

const SITEMAP_LIMIT = 1000;

export async function listPublicCatalogIds(): Promise<{ productos: { id: string; updated_at: string }[]; emprendimientos: { id: string; updated_at: string }[] }> {
  try {
    const db = createPublicClient();
    const [productos, emprendimientos] = await Promise.all([
      db.from("productos").select("id, updated_at").eq("disponible", true).limit(SITEMAP_LIMIT),
      db.from("emprendimientos").select("id, updated_at").eq("activo", true).limit(SITEMAP_LIMIT),
    ]);
    return { productos: productos.data ?? [], emprendimientos: emprendimientos.data ?? [] };
  } catch {
    return { productos: [], emprendimientos: [] };
  }
}

/** Recorta la descripción a un largo razonable para el snippet de buscadores. */
export function snippet(text: string | null, fallback: string, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
