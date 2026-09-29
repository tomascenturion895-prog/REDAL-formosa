"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Foco de un diálogo modal: al abrirse lo mueve adentro, mantiene el Tab dentro y al cerrarse lo
 * devuelve al elemento que lo abrió. Sin esto, con teclado se sigue navegando la página que quedó detrás.
 */
export function useDialogFocus(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const dialog = ref.current;
    if (!active || !dialog) return;

    const opener = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    // El primer control es el botón de cerrar; si hay otro, es más útil empezar por la acción segura.
    (focusable()[1] ?? focusable()[0] ?? dialog).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [ref, active]);
}
