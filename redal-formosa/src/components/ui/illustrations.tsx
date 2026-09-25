export type IllustrationName = "basket" | "map" | "search" | "error";

/** Ilustraciones vectoriales de los estados vacíos. Solo usan tokens, así que siguen el tema claro/oscuro. */
const PRIMARY = "var(--color-primary-500)";
const SOFT = "var(--success-soft)";
const SUN = "var(--highlight)";
const LINE = "var(--foreground)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" className="h-auto w-40">
      <ellipse cx="80" cy="108" rx="52" ry="6" fill={LINE} opacity="0.08" />
      {children}
    </svg>
  );
}

function Basket() {
  return (
    <Frame>
      <circle cx="80" cy="58" r="44" fill={SOFT} />
      <path d="M40 54h80l-9 44a6 6 0 0 1-6 5H55a6 6 0 0 1-6-5z" fill={SUN} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M56 54c0-14 10-24 24-24s24 10 24 24" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M58 66v24M72 66v24M88 66v24M102 66v24" stroke={LINE} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M96 30c8-10 20-10 24-4-6 6-16 8-24 4Z" fill={PRIMARY} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 46c-8-6-8-16-2-20 6 4 8 14 2 20Z" fill={PRIMARY} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
    </Frame>
  );
}

function MapIllustration() {
  return (
    <Frame>
      <circle cx="80" cy="58" r="44" fill={SOFT} />
      <path d="M38 40l26-8 32 10 26-8v50l-26 8-32-10-26 8z" fill="var(--surface)" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M64 32v50M96 42v50" stroke={LINE} strokeWidth="2" opacity="0.35" />
      <path d="M80 22c-9 0-16 7-16 15 0 11 16 27 16 27s16-16 16-27c0-8-7-15-16-15Z" fill={PRIMARY} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="80" cy="37" r="5.5" fill={SUN} stroke={LINE} strokeWidth="2" />
    </Frame>
  );
}

function SearchIllustration() {
  return (
    <Frame>
      <circle cx="80" cy="58" r="44" fill={SOFT} />
      <circle cx="74" cy="52" r="24" fill="var(--surface)" stroke={LINE} strokeWidth="3" />
      <path d="m92 70 18 18" stroke={LINE} strokeWidth="6" strokeLinecap="round" />
      <path d="M64 56c3 6 17 6 20 0" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="66" cy="45" r="2.5" fill={LINE} />
      <circle cx="82" cy="45" r="2.5" fill={LINE} />
      <path d="M104 26l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={SUN} />
    </Frame>
  );
}

function ErrorIllustration() {
  return (
    <Frame>
      <circle cx="80" cy="58" r="44" fill="var(--warning-soft)" />
      <path d="M80 24c-16 0-28 12-28 28 0 8 3 12 3 18h50c0-6 3-10 3-18 0-16-12-28-28-28Z" fill="var(--surface)" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M62 82h36v6a6 6 0 0 1-6 6H68a6 6 0 0 1-6-6z" fill={SUN} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M80 36v20" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="66" r="3" fill={LINE} />
    </Frame>
  );
}

const MAP: Record<IllustrationName, () => React.ReactNode> = {
  basket: Basket,
  map: MapIllustration,
  search: SearchIllustration,
  error: ErrorIllustration,
};

export function Illustration({ name }: { name: IllustrationName }) {
  const Component = MAP[name];
  return <Component />;
}
