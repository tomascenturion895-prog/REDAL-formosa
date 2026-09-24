import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white font-black text-sm">
                R
              </div>
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                REDAL <span className="text-emerald-600 font-bold">Formosa</span>
              </span>
            </div>
            <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Red de Emprendimientos y Desarrollo de Abastecimiento Local.
              Conectando a pequeños y medianos productores agroecológicos y familiares
              de la provincia de Formosa con vecinos, ferias, verdulerías y el canal
              gastronómico B2B.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Laguna Naineck
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                El Colorado
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Clorinda
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Pirané
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Formosa Capital
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Estructura de Rutas
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link
                  href="/productor/chacra-la-esperanza"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Catálogo Público (/productor/[id])
                </Link>
              </li>
              <li>
                <Link
                  href="/b2b"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Canal B2B Comercios (/b2b)
                </Link>
              </li>
              <li>
                <span className="text-zinc-400 dark:text-zinc-600">
                  Panel Productor (Próximamente)
                </span>
              </li>
            </ul>
          </div>

          {/* Institutional / Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Desarrollo & Buenas Prácticas
            </h3>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Módulo desarrollado por <strong>Dev 3</strong> (Frontend - Catálogo & B2B).
              Diseñado con Next.js App Router, Tailwind CSS, TypeScript y arquitectura modular
              lista para conectar a Supabase.
            </p>
            <div className="mt-4 text-xs text-zinc-400">
              © {new Date().getFullYear()} REDAL Formosa. Circuito Corto de Comercialización.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
