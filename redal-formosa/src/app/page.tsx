import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { MOCK_PRODUCERS } from "@/data/mock/producers";

export default function Home() {
  const producersList = Object.values(MOCK_PRODUCERS);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-zinc-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-emerald-200 border border-white/15">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            REDAL Formosa • Dev 3 (Frontend - Catálogo & B2B)
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Red de Abastecimiento Local de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-white">
              Formosa
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Plataforma digital para visibilizar la producción agroecológica familiar de la provincia,
            posibilitar compras directas al consumidor y abastecer al canal gastronómico y comercial B2B.
          </p>

          {/* Quick Route Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 text-left">
            <Link
              href="/productor/chacra-la-esperanza"
              className="group rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 p-5 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Ruta 1
                </span>
                <span className="text-xs text-white/70 group-hover:translate-x-1 transition-transform">
                  Ir al catálogo →
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Catálogo del Productor
              </h3>
              <p className="text-xs text-emerald-100/80 mt-1">
                <code>/productor/[id]</code>: Vista pública maquetada con filtros, búsqueda,
                frescura de cosecha y pedidos directos a WhatsApp.
              </p>
            </Link>

            <Link
              href="/b2b"
              className="group rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 p-5 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Ruta 2
                </span>
                <span className="text-xs text-white/70 group-hover:translate-x-1 transition-transform">
                  Ir al canal B2B →
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Portal Mayorista & Comercios
              </h3>
              <p className="text-xs text-emerald-100/80 mt-1">
                <code>/b2b</code>: Abastecimiento por volumen para restaurantes y verdulerías con
                cotizador RFQ y lotes mayoristas.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                Chacras y Productores Disponibles en la Demo
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hacé click en cualquier productor para navegar su vista pública dinámica <code>/productor/[id]</code>
              </p>
            </div>
            <Badge variant="primary" size="md">
              🌱 Datos contextualizados a Formosa
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {producersList.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-5 transition-all hover:border-emerald-400"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {prod.ubicacion.localidad}, {prod.ubicacion.departamento}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                        {prod.nombre}
                      </h3>
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        {prod.titular} • {prod.rubroPrincipal}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {prod.descripcionCorta}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {prod.certificaciones.map((cert) => (
                      <Badge key={cert.id} variant="success" size="sm">
                        {cert.nombre}
                      </Badge>
                    ))}
                    {prod.aceptaB2B && (
                      <Badge variant="accent" size="sm">
                        Acepta B2B
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    ID: <code>{prod.id}</code>
                  </span>
                  <Link
                    href={`/productor/${prod.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600"
                  >
                    Ver Catálogo Público
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
