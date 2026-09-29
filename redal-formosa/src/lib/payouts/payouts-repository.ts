import { createClient, type Db } from "@/lib/supabase/client";
import { unwrap } from "@/lib/supabase/repository";

export interface PendingPayout {
  emprendimiento_id: string;
  emprendimiento_nombre: string;
  cantidad_pedidos: number;
  monto_bruto: number;
  comision_pct: number;
  comision: number;
  monto_neto: number;
}

export interface Payout {
  id: string;
  emprendimiento_id: string;
  cantidad_pedidos: number;
  monto_bruto: number;
  comision_pct: number;
  comision: number;
  monto_neto: number;
  referencia: string;
  pagado_en: string;
}

/** Cobros del vendedor: lo que se le debe hoy y lo que ya se le transfirió. La base decide qué ve cada persona. */
export class PayoutsRepository {
  constructor(private readonly db: Db = createClient()) {}

  async pending(): Promise<PendingPayout[]> {
    const rows = await unwrap(this.db.rpc("productor_cobro_pendiente"), "cargar cobros pendientes");
    return rows.map((r) => ({
      ...r,
      cantidad_pedidos: Number(r.cantidad_pedidos),
      monto_bruto: Number(r.monto_bruto),
      comision_pct: Number(r.comision_pct),
      comision: Number(r.comision),
      monto_neto: Number(r.monto_neto),
    }));
  }

  async history(limit = 50): Promise<Payout[]> {
    const rows = await unwrap(
      this.db.from("liquidaciones").select("*").order("pagado_en", { ascending: false }).limit(limit),
      "cargar liquidaciones",
    );
    return rows.map((r) => ({
      ...r,
      monto_bruto: Number(r.monto_bruto),
      comision_pct: Number(r.comision_pct),
      comision: Number(r.comision),
      monto_neto: Number(r.monto_neto),
    }));
  }
}

export const payoutsRepository = new PayoutsRepository();
