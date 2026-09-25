import type { ReactNode } from "react";

export type AlertTone = "error" | "success" | "info" | "warning";

const TONE: Record<AlertTone, string> = {
  error: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
};

/** Mensaje de estado. Los errores se anuncian a lectores de pantalla (role="alert"). */
export function Alert({ tone = "info", children, className = "" }: { tone?: AlertTone; children: ReactNode; className?: string }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-control px-4 py-3 text-sm ${TONE[tone]} ${className}`}>
      {children}
    </div>
  );
}
