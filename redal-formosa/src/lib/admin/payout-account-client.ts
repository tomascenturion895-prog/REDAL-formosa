import type { BankAccount } from "@/lib/domain/banks";

/** Pide al servidor la cuenta bancaria descifrada del vendedor (solo administradores). */
export async function fetchPayoutAccount(emprendimientoId: string): Promise<BankAccount> {
  const response = await fetch(`/api/admin/payout-account?emprendimientoId=${encodeURIComponent(emprendimientoId)}`);
  const body = (await response.json().catch(() => ({}))) as { account?: BankAccount; error?: string };
  if (!response.ok || !body.account) throw new Error(body.error ?? "No pudimos obtener la cuenta bancaria.");
  return body.account;
}
