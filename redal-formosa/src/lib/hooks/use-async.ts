"use client";

import { useCallback, useEffect, useState, type DependencyList } from "react";

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  /** true hasta que la última carga (o recarga) termina. */
  loading: boolean;
  /** Vuelve a ejecutar la carga. */
  reload: () => void;
}

interface Options {
  /** false pospone la carga (por ejemplo, hasta que haya sesión). */
  enabled?: boolean;
}

/**
 * Carga asíncrona con cancelación: evita actualizar estado de un componente
 * desmontado o de una petición vieja. Reemplaza el useEffect + useState(loading/error)
 * que se repetía en cada página.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList, { enabled = true }: Options = {}): AsyncState<T> {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: enabled });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    // Al cambiar las dependencias empieza una carga nueva: se marca como pendiente
    // sin descartar el dato anterior, para no parpadear en recargas.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, error: undefined, loading: true }));
    loader().then(
      (data) => !cancelled && setState({ data, loading: false }),
      (err: unknown) =>
        !cancelled && setState({ error: err instanceof Error ? err : new Error(String(err)), loading: false }),
    );
    return () => {
      cancelled = true;
    };
    // loader cambia en cada render; el llamador controla cuándo recargar mediante deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, version, ...deps]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data: state.data, error: state.error, loading: enabled ? state.loading : false, reload };
}
