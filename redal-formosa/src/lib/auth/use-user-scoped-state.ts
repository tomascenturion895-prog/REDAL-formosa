"use client";

import { useCallback, useState } from "react";

import { useAuth } from "./auth-context";

type Updater<T> = T | ((previous: T) => T);

/**
 * useState que vuelve a su valor inicial cuando cambia la persona con sesión (login, logout o cambio
 * de cuenta). Para estado que pertenece a una cuenta —favoritos marcados, filtros guardados— y no
 * debe pasar a la siguiente aunque el componente siga montado.
 */
export function useUserScopedState<T>(initial: () => T): [T, (updater: Updater<T>) => void] {
  const { user } = useAuth();
  const owner = user?.id ?? null;
  const [state, setState] = useState<{ owner: string | null; value: T }>(() => ({ owner, value: initial() }));

  const value = state.owner === owner ? state.value : initial();

  const set = useCallback(
    (updater: Updater<T>) =>
      setState((prev) => {
        const base = prev.owner === owner ? prev.value : initial();
        return { owner, value: typeof updater === "function" ? (updater as (p: T) => T)(base) : updater };
      }),
    // initial es una función estable en cada uso; owner es lo que define a quién pertenece el valor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [owner],
  );

  return [value, set];
}
