"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

/**
 * Campo de contraseña con botón integrado para alternar visibilidad (ojito SVG).
 * Respeta estilos y tokens del sistema (claro / oscuro) y accesibilidad con teclado.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className = "", id, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        id={id}
        type={showPassword ? "text" : "password"}
        className={`field pr-11 ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={0}
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
        aria-pressed={showPassword}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:text-foreground hover:bg-surface-muted/60 focus-visible:outline-2 focus-visible:outline-ring transition-colors"
      >
        {showPassword ? <EyeOffIcon size={19} /> : <EyeIcon size={19} />}
      </button>
    </div>
  );
});
