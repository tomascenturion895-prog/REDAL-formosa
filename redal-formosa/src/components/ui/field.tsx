import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
}

/** Etiqueta + control + ayuda. El control debe usar el mismo id. */
export function Field({ id, label, optional, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label} {optional && <span className="font-normal text-muted">(opcional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
