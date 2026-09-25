const KNOWN: [RegExp, string][] = [
  [/invalid login credentials/i, "El email o la contraseña no son correctos."],
  [/email not confirmed/i, "Todavía no confirmaste tu email. Revisá tu bandeja de entrada."],
  [/user already registered|already been registered/i, "Ese email ya tiene una cuenta. Probá ingresar."],
  [/password should be at least/i, "La contraseña debe tener al menos 6 caracteres."],
  [/rate limit|too many/i, "Hiciste demasiados intentos. Esperá unos minutos y probá de nuevo."],
  [/network|failed to fetch/i, "No pudimos conectarnos. Revisá tu conexión."],
];

export function authErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return KNOWN.find(([pattern]) => pattern.test(raw))?.[1] ?? "Algo salió mal. Intentá de nuevo.";
}

// Solo rutas internas: evita que ?next= redirija a un sitio externo.
export function safeNextPath(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
