"use client";

import { useEffect } from "react";

export function PWAInstaller() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => {
          console.log("✓ Service Worker registered");
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    }

    // Handle PWA install prompt
    let deferredPrompt: any = null;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as any;

      // Show install button if needed
      localStorage.setItem("pwa-installable", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  return null;
}
