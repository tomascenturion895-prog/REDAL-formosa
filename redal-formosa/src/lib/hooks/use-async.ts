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
  /**
   * Dueño de los datos (normalmente el id de la persona con sesión). Si cambia, el dato y el error
   * anteriores dejan de mostrarse al instante: así no se filtra nada de una cuenta a otra.
   */
  scope?: string | null;
}

/**
 * Carga asíncrona con cancelación: evita actualizar estado de un componente
 * desmontado o de una petición vieja. Reemplaza el useEffect + useState(loading/error)
 * que se repetía en cada página.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList, { enabled = true, scope }: Options = {}): AsyncState<T> {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean; scope?: string | null }>({ loading: enabled, scope });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    // Al cambiar las dependencias empieza una carga nueva: se marca como pendiente
    // sin descartar el dato anterior, para no parpadear en recargas.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => (prev.scope === scope ? { ...prev, error: undefined, loading: true } : { loading: true, scope }));
    loader().then(
      (data) => !cancelled && setState({ data, loading: false, scope }),
      (err: unknown) =>
        !cancelled && setState({ error: err instanceof Error ? err : new Error(String(err)), loading: false, scope }),
    );
    return () => {
      cancelled = true;
    };
    // loader cambia en cada render; el llamador controla cuándo recargar mediante deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, version, scope, ...deps]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // Datos de otra cuenta: no se muestran ni un instante, aunque el efecto todavía no haya corrido.
  const foreign = state.scope !== scope;
  return {
    data: foreign ? undefined : state.data,
    error: foreign ? undefined : state.error,
    loading: enabled ? state.loading || foreign : false,
    reload,
  };
}
