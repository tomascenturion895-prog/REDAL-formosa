import type { ReactNode } from "react";

import { Illustration, type IllustrationName } from "./illustrations";

/**
 * Estado vacío o de error. Sin `icon` muestra una ilustración (por defecto la canasta);
 * `illustration` elige otra según el caso: "map", "search" o "error".
 */
export function EmptyState({
  icon,
  illustration = "basket",
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  illustration?: IllustrationName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      {icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-action">{icon}</div>
      ) : (
        <Illustration name={illustration} />
      )}
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
