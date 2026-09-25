"use client";

import "./globals.css";

// Último recurso: reemplaza al layout raíz, así que no depende de proveedores ni de fuentes propias.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es-AR">
      <body className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-title">Se nos pinchó una rueda</h1>
          <p className="text-muted">Algo falló de nuestro lado. Probá de nuevo en un momento.</p>
          <button type="button" onClick={reset} className="btn btn-primary !px-8 !py-3.5">
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
