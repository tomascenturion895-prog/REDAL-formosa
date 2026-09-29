import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  /** Mensaje de validación. Se muestra debajo del control y lo marca como inválido. */
  error?: string | null;
  children: ReactNode;
}

/**
 * Etiqueta + control + ayuda/error. El control debe usar el mismo id.
 * Si el hijo es un único elemento, recibe `aria-describedby` y `aria-invalid` para que los lectores
 * de pantalla lean la ayuda y el error al enfocarlo.
 */
export function Field({ id, label, optional, hint, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control =
    isValidElement(children) && (describedBy || error)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
        })
      : children;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label} {optional && <span className="font-normal text-muted">(opcional)</span>}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
