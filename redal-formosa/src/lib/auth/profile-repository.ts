import { createClient, type Db } from "@/lib/supabase/client";
import { unwrapOptional } from "@/lib/supabase/repository";
import type { UserRole } from "@/lib/supabase/types";

export class ProfileRepository {
  constructor(private readonly db: Db = createClient()) {}

  /** Rol de la persona con sesión. Solo decide qué enlaces se muestran; los permisos los impone la base. */
  async roleOf(userId: string): Promise<UserRole | null> {
    const row = await unwrapOptional(this.db.from("profiles").select("role").eq("id", userId).maybeSingle(), "consultar rol");
    return row?.role ?? null;
  }
}

export const profileRepository = new ProfileRepository();
