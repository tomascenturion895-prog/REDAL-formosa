import type { BankAccount } from "@/lib/domain/banks";

/**
 * Envía la cuenta bancaria al servidor, que la valida y la guarda cifrada.
 * No pasa por Supabase desde el navegador: nunca debe quedar texto plano en la base.
 */
export async function saveBankAccount(account: BankAccount): Promise<void> {
  const response = await fetch("/api/producer/bank-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(error ?? "No pudimos guardar tus datos bancarios. Intentá de nuevo.");
  }
}
