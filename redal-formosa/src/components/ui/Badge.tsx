import React from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "info"
  | "primary"
  | "accent"
  | "outline"
  | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "primary",
  className = "",
  size = "md",
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors";

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs sm:text-sm",
  };

  const variantClasses = {
    primary:
      "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    success:
      "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800",
    warning:
      "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    info: "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    accent:
      "bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
    outline:
      "bg-transparent text-zinc-700 border border-zinc-300 dark:text-zinc-300 dark:border-zinc-700",
    neutral:
      "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
