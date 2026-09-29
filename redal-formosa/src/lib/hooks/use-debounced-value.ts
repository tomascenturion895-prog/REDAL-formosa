import { useEffect, useState } from "react";

/** Devuelve `value` recién después de que dejó de cambiar durante `delayMs` (p. ej. para no buscar en cada tecla). */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
