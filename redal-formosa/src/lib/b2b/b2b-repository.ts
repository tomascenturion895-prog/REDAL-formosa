import type { B2BRequest, B2BRequestInput } from "@/lib/domain/b2b";
import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap } from "@/lib/supabase/repository";

const COLUMNS = "id, razon_social, tipo_comercio, localidad, contacto_nombre, telefono, productos, volumen, frecuencia, mensaje, created_at, expires_at";

/** Solicitudes de cotización mayorista. La base valida, limita y decide quién ve qué. */
export class B2BRepository {
  constructor(private readonly db: Db = createClient()) {}

  async create(input: B2BRequestInput): Promise<void> {
    const { error } = await this.db.rpc("crear_solicitud_b2b", {
      p_razon_social: input.razonSocial,
      p_tipo: input.tipo,
      p_localidad: input.localidad,
      p_cuit: input.cuit,
      p_contacto: input.contacto,
      p_telefono: input.telefono,
      p_productos: input.productos,
      p_volumen: input.volumen,
      p_frecuencia: input.frecuencia,
      p_mensaje: input.mensaje,
    });
    // El mensaje de la base ("Ya tenés 3 solicitudes abiertas…") está pensado para mostrarse tal cual.
    if (error) throw new RepositoryError(error.code === "22023" ? error.message : `enviar solicitud: ${error.message}`, error);
  }

  /** Las abiertas y vigentes de la persona con sesión. */
  async mine(): Promise<B2BRequest[]> {
    return await unwrap(
      this.db
        .from("solicitudes_b2b")
        .select(COLUMNS)
        .eq("estado", "abierta")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false }),
      "cargar mis solicitudes",
    );
  }

  async close(id: string): Promise<void> {
    const { error } = await this.db.rpc("cerrar_solicitud_b2b", { p_id: id });
    if (error) throw new RepositoryError(`cerrar solicitud: ${error.message}`, error);
  }

  /** Tablero del vendedor: todas las solicitudes abiertas de la red. */
  async board(): Promise<B2BRequest[]> {
    const rows = await unwrap(this.db.rpc("productor_solicitudes_b2b"), "cargar solicitudes mayoristas");
    return rows.map((r) => ({ ...r, mensaje: r.mensaje ?? null }));
  }
}

export const b2bRepository = new B2BRepository();
