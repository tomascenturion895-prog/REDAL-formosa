import { createClient, type Db } from "@/lib/supabase/client";
import { cleanNovedad } from "@/lib/domain/novedad";
import { unwrap } from "@/lib/supabase/repository";

export interface Novedad {
  id: string;
  contenido: string;
  createdAt: string;
  emprendimientoId: string;
  emprendimientoNombre: string;
}

const SELECT = "id, contenido, created_at, emprendimiento_id, emprendimientos(nombre)";

interface NovedadRow {
  id: string;
  contenido: string;
  created_at: string;
  emprendimiento_id: string;
  emprendimientos: { nombre: string } | null;
}

function toNovedad(row: NovedadRow): Novedad {
  return {
    id: row.id,
    contenido: row.contenido,
    createdAt: row.created_at,
    emprendimientoId: row.emprendimiento_id,
    emprendimientoNombre: row.emprendimientos?.nombre ?? "Emprendimiento",
  };
}

/** Novedades que publican los vendedores: el feed del inicio y el tablero del propio vendedor. */
export class NovedadesRepository {
  constructor(private readonly db: Db = createClient()) {}

  async latest(limit = 6): Promise<Novedad[]> {
    const rows = await unwrap(
      this.db.from("novedades").select(SELECT).order("created_at", { ascending: false }).limit(limit),
      "listar novedades",
    );
    return (rows as unknown as NovedadRow[]).map(toNovedad);
  }

  async listFor(emprendimientoId: string, limit = 10): Promise<Novedad[]> {
    const rows = await unwrap(
      this.db
        .from("novedades")
        .select(SELECT)
        .eq("emprendimiento_id", emprendimientoId)
        .order("created_at", { ascending: false })
        .limit(limit),
      "listar novedades del emprendimiento",
    );
    return (rows as unknown as NovedadRow[]).map(toNovedad);
  }

  async publish(emprendimientoId: string, text: string): Promise<void> {
    const contenido = cleanNovedad(text);
    await unwrap(this.db.from("novedades").insert({ emprendimiento_id: emprendimientoId, contenido }), "publicar novedad");
  }

  async remove(id: string): Promise<void> {
    await unwrap(this.db.from("novedades").delete().eq("id", id), "borrar novedad");
  }
}

export const novedadesRepository = new NovedadesRepository();
