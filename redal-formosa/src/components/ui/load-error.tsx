import { EmptyState } from "./empty-state";

/** Estado de error de una pantalla que no pudo cargar sus datos: distinto de «no hay nada» y con salida. */
export function LoadError({
  title = "No pudimos cargar esta pantalla",
  description = "Puede ser tu conexión o un problema nuestro. Probá de nuevo en un momento.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      illustration="error"
      title={title}
      description={description}
      action={
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Reintentar
        </button>
      }
    />
  );
}
