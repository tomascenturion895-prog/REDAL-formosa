/** Primer elemento enfocable: deja a quien navega con teclado saltar la cabecera e ir al contenido (WCAG 2.4.1). */
export function SkipLink() {
  return (
    <a
      href="#contenido"
      className="fixed left-4 top-4 z-[3000] -translate-y-24 rounded-control bg-action px-4 py-2 text-sm font-semibold text-on-action shadow-pop transition-transform focus:translate-y-0"
    >
      Saltar al contenido
    </a>
  );
}
