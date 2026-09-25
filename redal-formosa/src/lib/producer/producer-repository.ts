import { createClient, type Db } from "@/lib/supabase/client";
import { RepositoryError, unwrap, unwrapOptional } from "@/lib/supabase/repository";
import type { Row } from "@/lib/supabase/types";

export type Emprendimiento = Row<"emprendimientos">;
export type Product = Row<"productos">;
export type IdentityDocument = "dni_frente" | "dni_reverso" | "selfie";

export interface NewEmprendimiento {
  ownerId: string;
  nombre: string;
  descripcion?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface EmprendimientoLocation {
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  horario_apertura: string;
  horario_cierre: string;
}

export interface NewProduct {
  emprendimientoId: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  unidad: string;
  imagenUrl?: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Debe coincidir con el bucket de Storage (migración 12): mismo límite y mismos tipos.
function imageExtension(file: File): string {
  const ext = IMAGE_EXTENSIONS[file.type];
  if (!ext) throw new RepositoryError("La imagen debe ser JPG, PNG o WebP");
  if (file.size > MAX_IMAGE_BYTES) throw new RepositoryError("La imagen no puede pesar más de 5 MB");
  return ext;
}

function documentColumns(kind: IdentityDocument, path: string) {
  switch (kind) {
    case "dni_frente":
      return { dni_frente_url: path };
    case "dni_reverso":
      return { dni_reverso_url: path };
    case "selfie":
      return { selfie_url: path };
  }
}

/** Todo lo que el productor administra: emprendimiento, productos, cobro e identidad. */
export class ProducerRepository {
  constructor(private readonly db: Db = createClient()) {}

  /** Lo que falta para poder cobrar: identidad verificada y cuenta bancaria cargada (el dato en sí nunca se lee). */
  async payoutReadiness(
    userId: string,
  ): Promise<{ verification: "pendiente" | "approved" | "rejected" | "pending_review"; hasBankAccount: boolean }> {
    const row = await unwrapOptional(
      this.db.from("profiles").select("verification_status, bank_account").eq("id", userId).maybeSingle(),
      "cargar estado de cobro",
    );
    return { verification: row?.verification_status ?? "pendiente", hasBankAccount: Boolean(row?.bank_account) };
  }

  async ownEmprendimientos(ownerId: string): Promise<Emprendimiento[]> {
    return await unwrap(
      this.db.from("emprendimientos").select("*").eq("owner_id", ownerId).order("created_at", { ascending: true }),
      "listar mis emprendimientos",
    );
  }

  async createEmprendimiento(input: NewEmprendimiento): Promise<string> {
    const row = await unwrap(
      this.db
        .from("emprendimientos")
        .insert({
          owner_id: input.ownerId,
          nombre: input.nombre,
          descripcion: input.descripcion ?? null,
          telefono: input.telefono ?? null,
          email: input.email ?? null,
        })
        .select("id")
        .single(),
      "crear emprendimiento",
    );
    return row.id;
  }

  async setLocation(emprendimientoId: string, location: EmprendimientoLocation): Promise<void> {
    const { error } = await this.db.from("emprendimientos").update(location).eq("id", emprendimientoId);
    if (error) throw new RepositoryError(`guardar ubicación: ${error.message}`, error);
  }

  async listProducts(emprendimientoId: string): Promise<Product[]> {
    return await unwrap(
      this.db
        .from("productos")
        .select("*")
        .eq("emprendimiento_id", emprendimientoId)
        .order("created_at", { ascending: false }),
      "listar productos",
    );
  }

  async createProduct(input: NewProduct): Promise<void> {
    const { error } = await this.db.from("productos").insert({
      emprendimiento_id: input.emprendimientoId,
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      precio: input.precio,
      unidad: input.unidad,
      imagen_url: input.imagenUrl || null,
    });
    if (error) throw new RepositoryError(`crear producto: ${error.message}`, error);
  }

  async setProductAvailability(productId: string, disponible: boolean): Promise<void> {
    const { error } = await this.db.from("productos").update({ disponible }).eq("id", productId);
    if (error) throw new RepositoryError(`actualizar producto: ${error.message}`, error);
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await this.db.from("productos").delete().eq("id", productId);
    if (error) throw new RepositoryError(`eliminar producto: ${error.message}`, error);
  }

  /** Sube la foto al bucket público y devuelve su URL. */
  async uploadProductImage(emprendimientoId: string, file: File): Promise<string> {
    const path = `${emprendimientoId}/${crypto.randomUUID()}.${imageExtension(file)}`;
    const { error } = await this.db.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (error) throw new RepositoryError(`subir imagen: ${error.message}`, error);
    return this.db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  /**
   * Guarda un documento de identidad en el bucket privado y registra su ruta (no una URL pública).
   * Solo el titular y los administradores pueden leerlo.
   */
  async saveIdentityDocument(userId: string, kind: IdentityDocument, file: File): Promise<void> {
    const path = `${userId}/${kind}-${crypto.randomUUID()}.${imageExtension(file)}`;
    const upload = await this.db.storage.from("biometric-verification").upload(path, file, { contentType: file.type });
    if (upload.error) throw new RepositoryError(`subir documento: ${upload.error.message}`, upload.error);

    const { error } = await this.db
      .from("validacion_biometrica")
      .upsert({ user_id: userId, estado: "pendiente", ...documentColumns(kind, path) }, { onConflict: "user_id" });
    if (error) throw new RepositoryError(`registrar documento: ${error.message}`, error);
  }

  async firstEmprendimientoId(ownerId: string): Promise<string | null> {
    const row = await unwrapOptional(
      this.db
        .from("emprendimientos")
        .select("id")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      "buscar emprendimiento",
    );
    return row?.id ?? null;
  }
}

export const producerRepository = new ProducerRepository();

