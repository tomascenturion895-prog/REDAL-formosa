import { ShieldIcon, StoreIcon, TruckIcon } from "@/components/ui/icons";

const PILLARS = [
  { icon: <StoreIcon size={22} />, title: "Directo de la chacra", text: "Sin intermediarios: hablás con quien produce y acordás precio por volumen." },
  { icon: <TruckIcon size={22} />, title: "Entrega a tu comercio", text: "Coordinás días y horarios de recepción con cada productor." },
  { icon: <ShieldIcon size={22} />, title: "Productores verificados", text: "Los emprendimientos de REDAL pasan por una revisión antes de publicar." },
];

/** Encabezado y beneficios de la página mayorista. */
export function B2BIntro() {
  return (
    <>
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-action">Canal mayorista</p>
        <h1 className="text-title mt-2">Comprá por volumen directo a productores de Formosa</h1>
        <p className="mt-3 text-lg text-muted">
          Restaurantes, verdulerías, hoteles y comedores: contanos qué necesitás y los productores de la red te escriben con precios y condiciones.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <li key={pillar.title} className="card space-y-2 p-5">
            <span className="text-action">{pillar.icon}</span>
            <h2 className="font-display text-lg font-semibold">{pillar.title}</h2>
            <p className="text-sm text-muted">{pillar.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
