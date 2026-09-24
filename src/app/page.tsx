import Map from "@/components/Map";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-md">
            R
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-none text-slate-900 dark:text-white">
              REDAL <span className="text-emerald-600 dark:text-emerald-400">Formosa</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Red de Emprendimientos y Desarrollo de Abastecimiento Local
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <a
            href="#mapa"
            className="px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Mapa Territorial
          </a>
          <a
            href="/b2b"
            className="px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Tablero B2B
          </a>
          <a
            href="/productor/nuevo"
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Registrar Productor
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-emerald-400/20">
              📍 Provincia de Formosa, Argentina
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
              Descubrí la Oferta Productiva y Artesanal de Nuestra Tierra
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
              Conectamos de forma directa a productores, artesanos de comunidades originarias y PyMEs de Formosa con compradores locales y comercios. Sin intermediarios ni comisiones.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-white/15">
                🌾 Agroalimentario
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-white/15">
                🎨 Artesanías Wichi & Qom
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-white/15">
                🍲 Gastronomía Regional
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-white/15">
                ⚙️ PyMEs Industriales
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Mapa Interactivo */}
        <section id="mapa" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>🗺️</span> Mapa Georreferenciado de Oferta Local
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filtra por departamento o categoría y hacé clic en un marcador para explorar el catálogo y contactar por WhatsApp.
              </p>
            </div>
          </div>

          {/* Componente Mapa cargado dinámicamente con SSR deshabilitado */}
          <Map className="h-[580px] w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden" />
        </section>

        {/* Módulos Destacados / Características */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mb-3">
              💬
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Contacto Directo por WhatsApp
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mensajes preconfigurados para solicitar presupuestos o comprar insumos directamente con el emprendedor sin comisiones.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl mb-3">
              🤝
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Tablero de Demandas B2B
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hoteles, restaurantes y comercios publican requerimientos de compra al por mayor para abastecerse con producción formoseña.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mb-3">
              📲
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Optimizado para Móviles (PWA)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Diseñado para operar en zonas con señal variable, guardando en caché la información de perfiles y mapas.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        <p>
          REDAL Formosa © 2026 — Plataforma Abierta de Visibilización Productiva Local
        </p>
      </footer>
    </div>
  );
}
