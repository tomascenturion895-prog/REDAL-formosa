"use client";

import { useSyncExternalStore } from "react";

import { MoonIcon, SunIcon } from "@/components/ui/icons";

type Theme = "light" | "dark";

const STORAGE_KEY = "redal-theme";
const CHANGE_EVENT = "redal-theme-change";

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return systemPrefersDark() ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Sin almacenamiento: el cambio vale solo para esta visita.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Alterna claro/oscuro. Sin elección guardada, respeta la preferencia del sistema. */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "menu" }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={() => applyTheme(next)}
        className="flex w-full items-center gap-3 rounded-control px-4 py-3 text-base font-medium text-muted hover:bg-surface-muted hover:text-foreground"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        {next === "dark" ? "Modo oscuro" : "Modo claro"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      className="btn btn-ghost !h-10 !w-10 !rounded-full !p-0"
      aria-label={next === "dark" ? "Activar modo oscuro" : "Activar modo claro"}
      title={next === "dark" ? "Modo oscuro" : "Modo claro"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
