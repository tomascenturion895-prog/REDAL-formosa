"use client";

import { useEffect } from "react";

/** Registra el service worker. Solo en producción: en desarrollo interfiere con el hot reload. */
export function PWAInstaller() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);

  return null;
}
