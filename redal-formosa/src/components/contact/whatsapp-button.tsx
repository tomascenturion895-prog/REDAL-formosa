"use client";

import { useCanSeeContact } from "@/lib/contact/visibility";
import { whatsappLink } from "@/lib/domain/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";

interface WhatsAppButtonProps {
  telefono: string | null | undefined;
  mensaje: string;
  label?: string;
  size?: "md" | "sm";
  className?: string;
}

/** Abre el chat de WhatsApp del vendedor. Si el teléfono no es utilizable, no se dibuja nada. */
export function WhatsAppButton({ telefono, mensaje, label = "Escribir por WhatsApp", size = "md", className = "" }: WhatsAppButtonProps) {
  const canSee = useCanSeeContact();
  const href = whatsappLink(telefono, mensaje);
  if (!canSee || !href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-primary ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      <WhatsAppIcon size={size === "sm" ? 16 : 18} />
      {label}
    </a>
  );
}
