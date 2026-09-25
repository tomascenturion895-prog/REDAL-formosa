"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon, TrashIcon } from "./icons";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

/**
 * Modal de confirmación estilizado acorde a la identidad y diseño del sistema.
 * Reemplaza el `window.confirm` nativo del navegador con accesibilidad (WAI-ARIA),
 * soporte para tecla Escape, modo oscuro nativo y micro-animaciones.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="relative w-full max-w-md rounded-sheet bg-surface p-6 shadow-pop border border-border transition-all duration-150 animate-in zoom-in-95"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Cerrar ventana"
          className="absolute right-4 top-4 text-muted hover:text-foreground rounded-full p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-ring"
        >
          <CloseIcon size={18} />
        </button>

        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <TrashIcon size={24} />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-6">
            <h3 id="confirm-dialog-title" className="font-display text-xl font-bold text-foreground tracking-tight">
              {title}
            </h3>
            {description && (
              <div id="confirm-dialog-desc" className="mt-2 text-sm text-muted leading-relaxed">
                {description}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${
              isDestructive
                ? "!bg-danger !text-white hover:!bg-danger/90 font-semibold shadow-xs"
                : "btn-primary"
            }`}
            aria-busy={isLoading}
            disabled={isLoading}
            onClick={() => void onConfirm()}
          >
            {isLoading ? "Procesando…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
