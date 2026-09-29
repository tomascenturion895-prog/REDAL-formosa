/** Enlace a /login que vuelve a `path` después de ingresar (la ruta se valida al usarla: ver safeNextPath). */
export const loginHref = (path: string) => `/login?next=${encodeURIComponent(path)}`;
