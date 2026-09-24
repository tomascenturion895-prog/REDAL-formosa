"use client";

import { createClient } from "@/lib/supabase/client";

export function updateProfileField(
  userId: string,
  field: string,
  value: any
): Promise<{ error: any }> {
  const supabase = createClient();
  const updates: Record<string, any> = { [field]: value };

  // @ts-expect-error - Supabase types are too strict
  return supabase.from("profiles").update(updates).eq("id", userId);
}

export function insertEmprendimiento(
  data: Record<string, any>
): Promise<{ data: any; error: any }> {
  const supabase = createClient();
  // @ts-ignore
  return supabase.from("emprendimientos").insert(data);
}
