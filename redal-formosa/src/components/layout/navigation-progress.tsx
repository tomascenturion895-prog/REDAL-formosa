"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { BirdLoader } from "@/components/ui/bird-loader";

const DONE_EVENT = "redal:navigation-done";
/** No se muestra nada si la página carga más rápido que esto: evita un destello en navegaciones instantáneas. */
const SHOW_AFTER_MS = 120;
/** Una vez visible, se queda al menos este tiempo para que no parpadee. */
const MIN_VISIBLE_MS = 380;

/**
 * Pantalla de carga entre secciones: el fondo se difumina y un pajarito aletea en el centro. Aparece cuando la
 * persona toca un enlace, envía un formulario o vuelve atrás, y se va cuando la ruta cambia. Se maneja sobre el
 * DOM (sin estado de React) para no volver a renderizar nada mientras dura.
 */
export function NavigationProgress() {
  const overlay = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const routeKey = `${pathname}?${search}`;

  useEffect(() => {
    const el = overlay.current;
    if (!el) return;

    let active = false;
    let shownAt = 0;
    let showTimer: number | undefined;
    let hideTimer: number | undefined;
    let failsafe: number | undefined;

    const show = () => {
      if (!active) return;
      shownAt = Date.now();
      el.dataset.show = "true";
    };

    const hide = () => {
      el.dataset.show = "false";
      shownAt = 0;
    };

    const finish = () => {
      if (!active) return;
      active = false;
      window.clearTimeout(showTimer);
      window.clearTimeout(failsafe);
      if (!shownAt) return;
      hideTimer = window.setTimeout(hide, Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt)));
    };

    const begin = (maxMs: number) => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(failsafe);
      active = true;
      showTimer = window.setTimeout(show, SHOW_AFTER_MS);
      failsafe = window.setTimeout(finish, maxMs);
    };

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || !anchor.href || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      begin(30_000);
    };

    // Un formulario puede navegar (buscar, ingresar) o no (error de validación): tope corto.
    const onSubmit = () => begin(3_500);
    const onPopState = () => begin(15_000);

    window.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener(DONE_EVENT, finish);

    return () => {
      window.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener(DONE_EVENT, finish);
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(failsafe);
    };
  }, []);

  // La ruta cambió: la navegación terminó.
  useEffect(() => {
    window.dispatchEvent(new Event(DONE_EVENT));
  }, [routeKey]);

  return (
    <div
      ref={overlay}
      role="status"
      aria-live="polite"
      data-show="false"
      // Salida de emergencia: si algo se traba, tocar la pantalla la cierra.
      onClick={() => window.dispatchEvent(new Event(DONE_EVENT))}
      className="nav-loader fixed inset-0 z-[3000] flex flex-col items-center justify-center gap-3 bg-background/55 backdrop-blur-md"
    >
      <BirdLoader />
      <span className="text-sm font-medium text-muted">Cargando…</span>
    </div>
  );
}
