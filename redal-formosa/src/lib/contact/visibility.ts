"use client";

// Único punto que decide si se muestran los datos de contacto (Llamar y WhatsApp).
// Hoy son públicos. Para pedir sesión: `return Boolean(useAuth().user)`.
export function useCanSeeContact(): boolean {
  return true;
}
