"use client";

import type { ReactNode } from "react";

import { useCanSeeContact } from "@/lib/contact/visibility";
import { WhatsAppButton } from "./whatsapp-button";

/** Fila de botones de contacto: apilados a lo ancho en pantallas angostas, en fila desde `sm`. */
export function ContactBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">{children}</div>;
}

interface ContactActionsProps {
  telefono: string | null | undefined;
  /** Mensaje pre-cargado en WhatsApp. */
  mensaje: string;
  size?: "md" | "sm";
}

/** Botón "WhatsApp" que abre el chat con el vendedor. Se oculta si no se puede mostrar el contacto. */
export function ContactActions({ telefono, mensaje, size = "md" }: ContactActionsProps) {
  const canSee = useCanSeeContact();
  if (!canSee) return null;

  return <WhatsAppButton telefono={telefono} mensaje={mensaje} label="WhatsApp" size={size} />;
}
