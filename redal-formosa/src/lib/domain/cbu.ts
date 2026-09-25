const BLOCK1_WEIGHTS = [7, 1, 3, 9, 7, 1, 3];
const BLOCK2_WEIGHTS = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3];

// Dígito verificador de la normativa del BCRA: (10 - (Σ dígito × peso) mod 10) mod 10.
function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((acc, w, i) => acc + Number(digits[i]) * w, 0);
  return (10 - (sum % 10)) % 10;
}

/** Valida un CBU: 22 dígitos y los dos dígitos verificadores (banco/sucursal y cuenta). */
export function isValidCbu(cbu: string): boolean {
  if (!/^\d{22}$/.test(cbu)) return false;
  const block1 = cbu.slice(0, 8);
  const block2 = cbu.slice(8);
  return checkDigit(block1, BLOCK1_WEIGHTS) === Number(block1[7]) && checkDigit(block2, BLOCK2_WEIGHTS) === Number(block2[13]);
}
