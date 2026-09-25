// Los tipos de la base se generan con la CLI y no se editan a mano:
//   npx supabase gen types typescript --project-id <ref> --schema public > src/lib/supabase/database.types.ts
// Este archivo solo agrega alias de conveniencia.
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database as GeneratedDatabase, Enums, Tables } from "./database.types";

export type Database = GeneratedDatabase;
export type { Json } from "./database.types";

/** Cliente de Supabase tipado con el esquema de la app (navegador, servidor o service role). */
export type Db = SupabaseClient<Database>;

export type Row<T extends keyof Database["public"]["Tables"]> = Tables<T>;

export type UserRole = Enums<"user_role">;
export type OrderStatus = Enums<"order_status">;
export type PaymentStatus = Enums<"payment_status">;
export type VerificationStatus = Enums<"verification_status">;
