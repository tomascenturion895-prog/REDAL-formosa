import React from "react";
import Image from "next/image";
import { Producer } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProducerHeroProps {
  producer: Producer;
}

export function ProducerHero({ producer }: ProducerHeroProps) {
  const whatsappUrl = `https://wa.me/${producer.contacto.whatsapp}?text=${encodeURIComponent(
    `¡Hola ${producer.nombre}! Te contacto a través de REDAL Formosa. Quisiera consultar sobre la disponibilidad de tu catálogo para coordinar un pedido.`
  )}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all">
      {/* Cover / Banner Image */}
      <div className="relative h-48 sm:h-64 lg:h-72 w-full overflow-hidden bg-emerald-900">
        <Image
          src={producer.bannerUrl}
          alt={`Finca de ${producer.nombre}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover opacity-85 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Badges over banner */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Productor Verificado REDAL
            </span>
            {producer.aceptaB2B && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-zinc-950">
                Canal B2B / Mayorista
              </span>
            )}
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs text-white border border-white/20">
            Formosa, Argentina
          </span>
        </div>
      </div>

      {/* Profile Details Container */}
      <div className="px-5 pb-6 pt-0 sm:px-8">
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20">
          {/* Avatar & Main Headings */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white dark:border-zinc-900 bg-emerald-50 shadow-md">
              <Image
                src={producer.avatarUrl}
                alt={producer.nombre}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>

            <div className="pt-2 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  {producer.nombre}
                </h1>
              </div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span>{producer.titular}</span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span className="text-zinc-600 dark:text-zinc-400 font-normal">
                  {producer.rubroPrincipal}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                {/* Location Icon */}
                <span className="flex items-center gap-1 font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-emerald-600"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {producer.ubicacion.localidad}, {producer.ubicacion.departamento}
                </span>

                {/* Clock / Response Time */}
                <span className="hidden sm:flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {producer.tiempoRespuestaPromedio}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2 sm:pt-0">
            <Button
              variant="whatsapp"
              size="md"
              href={whatsappUrl}
              isExternal
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.05-1.07l-.29-.17-3.12.82.83-3.04-.19-.31a8.19 8.19 0 0 1-1.26-4.47c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3z" />
                </svg>
              }
            >
              Pedir por WhatsApp
            </Button>

            {producer.contacto.telefono && (
              <Button
                variant="outline"
                size="md"
                href={`tel:${producer.contacto.telefono}`}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
              >
                Llamar
              </Button>
            )}
          </div>
        </div>

        {/* Certifications and Badges Row */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Garantías:
          </span>
          {producer.certificaciones.map((cert) => (
            <Badge key={cert.id} variant="success" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              {cert.nombre}
            </Badge>
          ))}
          {producer.metodosCultivo.map((metodo, idx) => (
            <Badge key={idx} variant="neutral" size="sm">
              🌱 {metodo}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
