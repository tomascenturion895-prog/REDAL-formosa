'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Coordenadas predeterminadas centradas en la Provincia de Formosa, Argentina
const FORMOSA_CENTER: [number, number] = [-26.185, -58.175];
const DEFAULT_ZOOM = 8;

export interface ProducerMarker {
  id: string;
  name: string;
  category: string;
  department: string;
  locality?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  phoneWhatsapp?: string;
  verified?: boolean;
}

export interface MapLeafletProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  producers?: ProducerMarker[];
  showFilters?: boolean;
  onSelectProducer?: (producer: ProducerMarker) => void;
}

// Datos de prueba por defecto representativos de Formosa
export const DEFAULT_FORMOSA_PRODUCERS: ProducerMarker[] = [
  {
    id: 'prod-1',
    name: 'Miel Orgánica del Bañado',
    category: 'Agroalimentario',
    department: 'Patiño',
    locality: 'Bañado la Estrella / Las Lomitas',
    latitude: -24.705,
    longitude: -60.593,
    imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=400&q=80',
    phoneWhatsapp: '543704123456',
    verified: true,
  },
  {
    id: 'prod-2',
    name: 'Tejidos y Artesanías Qom & Wichí',
    category: 'Artesanías',
    department: 'Pilcomayo',
    locality: 'Clorinda',
    latitude: -25.284,
    longitude: -57.718,
    imageUrl: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=400&q=80',
    phoneWhatsapp: '543718987654',
    verified: true,
  },
  {
    id: 'prod-3',
    name: 'Harina de Mandioca & Almidón del Sur',
    category: 'Agroalimentario',
    department: 'Pirané',
    locality: 'El Colorado',
    latitude: -26.308,
    longitude: -59.372,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    phoneWhatsapp: '543704445566',
    verified: true,
  },
  {
    id: 'prod-4',
    name: 'Chacinados y Embutidos Artesanales Pirané',
    category: 'Gastronomía',
    department: 'Pirané',
    locality: 'Pirané Centro',
    latitude: -25.732,
    longitude: -59.109,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
    phoneWhatsapp: '543704556677',
    verified: false,
  },
  {
    id: 'prod-5',
    name: 'Cooperativa Agropecuaria Capital',
    category: 'Agroalimentario',
    department: 'Formosa Capital',
    locality: 'Formosa',
    latitude: -26.185,
    longitude: -58.175,
    imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=400&q=80',
    phoneWhatsapp: '543704112233',
    verified: true,
  },
  {
    id: 'prod-6',
    name: 'Muebles de Madera Nativa Ibarreta',
    category: 'Industria',
    department: 'Patiño',
    locality: 'Ibarreta',
    latitude: -25.215,
    longitude: -59.858,
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
    phoneWhatsapp: '543704334455',
    verified: true,
  },
];

// Helper para crear marcadores estilizados por categoría
function createCategoryIcon(category: string) {
  let bgColor = '#059669'; // Verde esmeralda por defecto
  let emoji = '🌾';

  const catLower = category.toLowerCase();
  if (catLower.includes('agro')) {
    bgColor = '#16a34a';
    emoji = '🌾';
  } else if (catLower.includes('artesan')) {
    bgColor = '#d97706';
    emoji = '🎨';
  } else if (catLower.includes('gastro')) {
    bgColor = '#ea580c';
    emoji = '🍲';
  } else if (catLower.includes('industr')) {
    bgColor = '#0284c7';
    emoji = '⚙️';
  } else if (catLower.includes('servic')) {
    bgColor = '#7c3aed';
    emoji = '🛠️';
  }

  return L.divIcon({
    className: 'custom-map-marker-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="transform: rotate(45deg); font-size: 16px; line-height: 1;">${emoji}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

// Componente para recentrar mapa dinámicamente
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function MapLeaflet({
  center = FORMOSA_CENTER,
  zoom = DEFAULT_ZOOM,
  className = 'h-[550px] w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden',
  producers = DEFAULT_FORMOSA_PRODUCERS,
  showFilters = true,
  onSelectProducer,
}: MapLeafletProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Todos');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);

  useEffect(() => {
    // Corregir icono por defecto de Leaflet en Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Lista de categorías únicas
  const categories = useMemo(() => {
    const set = new Set(producers.map((p) => p.category));
    return ['Todas', ...Array.from(set)];
  }, [producers]);

  // Lista de departamentos únicos
  const departments = useMemo(() => {
    const set = new Set(producers.map((p) => p.department));
    return ['Todos', ...Array.from(set)];
  }, [producers]);

  // Filtrar productores
  const filteredProducers = useMemo(() => {
    return producers.filter((p) => {
      const matchCategory =
        selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchDepartment =
        selectedDepartment === 'Todos' || p.department === selectedDepartment;
      return matchCategory && matchDepartment;
    });
  }, [producers, selectedCategory, selectedDepartment]);

  // Obtener ubicación actual del usuario
  const handleGetUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
          setMapCenter(coords);
          setMapZoom(12);
        },
        (error) => {
          alert('No se pudo obtener tu ubicación. Verifica los permisos de geolocalización en tu navegador.');
          console.error(error);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Barra de Filtros Flotante / Superior */}
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-sans">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>🔍</span> Filtros:
            </span>

            {/* Categoría */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Categoría: {cat}
                </option>
              ))}
            </select>

            {/* Departamento */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  Departamento: {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500 font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
              {filteredProducers.length} {filteredProducers.length === 1 ? 'productor' : 'productores'}
            </span>

            <button
              type="button"
              onClick={handleGetUserLocation}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              title="Centrar en mi posición GPS"
            >
              <span>🎯</span>
              <span>Mi Ubicación</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div className={`relative z-0 ${className}`}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <MapRecenter center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcador del Usuario si activó Geolocation */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'user-position-marker',
                html: `
                  <div style="
                    background-color: #2563eb;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.3);
                  "></div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <p className="font-bold text-blue-600">Tu Ubicación Actual</p>
                  <p className="text-slate-500">Geolocalización detectada</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Renderizado de productores filtrados */}
          {filteredProducers.map((producer) => (
            <Marker
              key={producer.id}
              position={[producer.latitude, producer.longitude]}
              icon={createCategoryIcon(producer.category)}
              eventHandlers={{
                click: () => onSelectProducer?.(producer),
              }}
            >
              <Popup className="redal-popup">
                <div className="p-1.5 max-w-xs font-sans text-slate-800">
                  {producer.imageUrl && (
                    <div className="relative overflow-hidden rounded-lg mb-2 h-28 w-full bg-slate-100">
                      <img
                        src={producer.imageUrl}
                        alt={producer.name}
                        className="w-full h-full object-cover"
                      />
                      {producer.verified && (
                        <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md flex items-center gap-0.5">
                          ✓ Validado
                        </span>
                      )}
                    </div>
                  )}

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {producer.name}
                  </h4>

                  <div className="flex items-center gap-1.5 my-1">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {producer.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      📍 {producer.department}
                    </span>
                  </div>

                  {producer.locality && (
                    <p className="text-xs text-slate-500 mb-2">
                      Localidad: {producer.locality}
                    </p>
                  )}

                  <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                    <a
                      href={`/productor/${producer.id}`}
                      className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors"
                    >
                      Ver Catálogo Completo
                    </a>

                    {producer.phoneWhatsapp && (
                      <a
                        href={`https://wa.me/${producer.phoneWhatsapp}?text=${encodeURIComponent(
                          `Hola, vi tu emprendimiento "${producer.name}" en la plataforma REDAL Formosa.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors"
                      >
                        <span>💬</span> Contactar WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
