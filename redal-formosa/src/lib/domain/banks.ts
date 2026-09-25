export const BANKS = [
  ["santander", "Santander"],
  ["galicia", "Galicia"],
  ["bbva", "BBVA"],
  ["macro", "Macro"],
  ["bna", "Banco Nación"],
  ["provincia", "Banco Provincia"],
  ["icbc", "ICBC"],
  ["otro", "Otro"],
] as const;

export type BankCode = (typeof BANKS)[number][0];

export const isBankCode = (value: unknown): value is BankCode => BANKS.some(([code]) => code === value);

export interface BankAccount {
  cbu: string;
  banco: BankCode;
  titular: string;
}
