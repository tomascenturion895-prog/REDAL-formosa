/** Pajarito de RedAL aleteando: la marca de carga del sitio. Solo usa tokens, así que sigue el tema claro/oscuro. */
export function BirdLoader({ size = 112 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={(size * 100) / 120}
      aria-hidden="true"
      className="bird-bob overflow-visible"
    >
      {/* ala de atrás */}
      <path
        className="bird-wing-back"
        style={{ transformOrigin: "58px 46px" }}
        d="M58 46 C52 22 34 10 14 12 C26 22 40 34 52 50 Z"
        fill="var(--color-primary-300)"
      />
      {/* cola */}
      <path d="M71 55 L100 68 L73 62 Z" fill="var(--color-primary-700)" />
      {/* cuerpo y cabeza */}
      <ellipse cx="60" cy="53" rx="16" ry="11" fill="var(--color-primary-500)" />
      <ellipse cx="60" cy="58" rx="9" ry="5" fill="var(--color-primary-200)" />
      <circle cx="45" cy="44" r="8.5" fill="var(--color-primary-500)" />
      {/* pico y ojo */}
      <path d="M38 43 L28 47 L38 48 Z" fill="var(--highlight)" />
      <circle cx="43.5" cy="42" r="1.7" fill="var(--foreground)" />
      {/* patitas */}
      <path d="M56 63 L54 72 M64 63 L64 72" stroke="var(--highlight)" strokeWidth="2" strokeLinecap="round" />
      {/* ala de adelante */}
      <path
        className="bird-wing-front"
        style={{ transformOrigin: "62px 47px" }}
        d="M62 47 C70 20 92 6 110 10 C98 24 84 36 68 52 Z"
        fill="var(--color-primary-400)"
      />
    </svg>
  );
}
