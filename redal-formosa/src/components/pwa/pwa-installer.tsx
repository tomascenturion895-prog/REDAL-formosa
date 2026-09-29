"use client";

import { useEffect } from "react";

/**
 * Registra el service worker. Solo en producción: en desarrollo interfiere con el hot reload.
 * En desarrollo, además, da de baja el que haya quedado registrado en este mismo origen por haber
 * probado antes la versión de producción (p. ej. en Docker), que dejaba código viejo en el navegador.
 */
export function PWAInstaller() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => void registration.unregister()))
        .catch(() => {});
      if ("caches" in window) caches.keys().then((keys) => keys.forEach((key) => void caches.delete(key))).catch(() => {});
      return;
    }
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);

  return null;
}
