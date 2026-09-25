import React from "react";

export function B2BBenefits() {
  const benefits = [
    {
      icon: "📦",
      title: "Venta por Bulto y Cajón Cerrado",
      description:
        "Bolsas de mandioca de 30kg, cajones torito de tomate de 18-20kg, bolsas de batata y baldes de miel pura. Escala comercial real.",
    },
    {
      icon: "🌱",
      title: "Maduración y Sabor Genuino",
      description:
        "Tus clientes notan la diferencia: hortalizas cosechadas en su punto óptimo, sin semanas en cámaras de frío artificial.",
    },
    {
      icon: "📋",
      title: "Trazabilidad y Respaldo",
      description:
        "Productores registrados en RENAF / SENASA. Posibilidad de programar entregas fijas semanales para tu menú o góndola.",
    },
    {
      icon: "🚚",
      title: "Logística Corta Provincial",
      description:
        "Rutas directas desde Laguna Naineck, El Colorado, Clorinda y Pirané hacia los centros urbanos y gastronómicos.",
    },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 lg:p-10 shadow-sm">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          ¿Por qué comprar a través de REDAL B2B?
        </span>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
          Ventajas estratégicas para tu negocio gastronómico o comercial
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-5 transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
          >
            <div>
              <span className="text-3xl">{b.icon}</span>
              <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">
                {b.title}
              </h3>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {b.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
