import type { ReactNode } from "react";

import { Illustration, type IllustrationName } from "@/components/ui/illustrations";

/** Pantalla completa de error (404, 500) con la identidad de la marca. */
export function ErrorScreen({
  illustration,
  code,
  title,
  description,
  actions,
}: {
  illustration: IllustrationName;
  code: string;
  title: string;
  description: string;
  actions: ReactNode;
}) {
  return (
    <div className="bg-organic flex flex-1 items-center justify-center px-4 py-section">
      <div className="flex max-w-lg flex-col items-center gap-4 text-center">
        <div className="scale-125">
          <Illustration name={illustration} />
        </div>
        <p className="mt-4 font-display text-sm font-semibold uppercase tracking-widest text-muted">{code}</p>
        <h1 className="text-title">{title}</h1>
        <p className="text-lg text-muted">{description}</p>
        <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{actions}</div>
      </div>
    </div>
  );
}
