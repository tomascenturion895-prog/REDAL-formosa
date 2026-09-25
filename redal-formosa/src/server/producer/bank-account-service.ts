import { isBankCode, type BankAccount } from "@/lib/domain/banks";
import { isValidCbu } from "@/lib/domain/cbu";
import type { Db } from "@/lib/supabase/types";
import { ServiceError } from "@/server/errors";
import type { SecretCipher } from "@/server/security/secret-cipher";

/**
 * Guarda la cuenta bancaria del productor cifrada. Valida en el servidor (la validación del
 * formulario es solo comodidad) y escribe con service role: el trigger de profiles impide que
 * un cliente grabe la columna directamente, así nunca queda texto plano.
 */
export class BankAccountService {
  constructor(
    private readonly db: Db,
    private readonly cipher: SecretCipher,
  ) {}

  async save(userId: string, input: unknown): Promise<void> {
    const account = this.validate(input);

    const { error } = await this.db
      .from("profiles")
      .update({ bank_account: this.cipher.encrypt(JSON.stringify(account)) })
      .eq("id", userId);
    if (error) throw new Error(`No se pudo guardar la cuenta bancaria: ${error.message}`);
  }

  /** Uso interno (por ejemplo, liquidaciones): devuelve la cuenta descifrada. */
  async load(userId: string): Promise<BankAccount | null> {
    const { data, error } = await this.db.from("profiles").select("bank_account").eq("id", userId).maybeSingle();
    if (error) throw new Error(`No se pudo leer la cuenta bancaria: ${error.message}`);
    return data?.bank_account ? (JSON.parse(this.cipher.decrypt(data.bank_account)) as BankAccount) : null;
  }

  private validate(input: unknown): BankAccount {
    const { cbu, banco, titular } = (input ?? {}) as Record<string, unknown>;

    if (typeof cbu !== "string" || !isValidCbu(cbu)) {
      throw new ServiceError("bad_request", "El CBU no es válido. Revisá que tenga 22 dígitos y que estén bien cargados.");
    }
    if (!isBankCode(banco)) throw new ServiceError("bad_request", "Elegí un banco de la lista.");
    if (typeof titular !== "string" || titular.trim().length < 2 || titular.length > 120) {
      throw new ServiceError("bad_request", "Ingresá el nombre del titular de la cuenta.");
    }
    return { cbu, banco, titular: titular.trim() };
  }
}
