'use client';

import dynamic from 'next/dynamic';
import type { MapLeafletProps } from './MapLeaflet';

// Carga dinámica de react-leaflet deshabilitando SSR para evitar errores en Next.js App Router
const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col items-center justify-center p-6 text-center shadow-inner">
      <div className="relative flex items-center justify-center mb-3">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-600 animate-spin" />
        <span className="absolute text-xl">📍</span>
      </div>
      <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
        Cargando Mapa Territorial de Formosa...
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
        REDAL — Red de Emprendimientos y Desarrollo de Abastecimiento Local
      </p>
    </div>
  ),
});

export interface MapProps extends MapLeafletProps {}

export default function Map(props: MapProps) {
  return <MapLeaflet {...props} />;
}

export type { ProducerMarker } from './MapLeaflet';
