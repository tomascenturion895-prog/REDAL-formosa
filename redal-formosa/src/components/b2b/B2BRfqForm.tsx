"use client";

import React, { useState } from "react";
import { BusinessType } from "@/types";

export function B2BRfqForm() {
  const [formData, setFormData] = useState({
    razonSocial: "",
    tipoComercio: "restaurante_gastronomico" as BusinessType,
    cuitOpcional: "",
    localidadEntrega: "Formosa Capital",
    direccionEntrega: "",
    contactoNombre: "",
    telefonoWhatsapp: "",
    email: "",
    frecuenciaRequerida: "semanal",
    productosInteres: "Mandioca seleccionada, Tomate platense criollo",
    volumenEstimado: "Aprox. 100-150 kg semanales",
    mensajeAdicional: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const text = `*SOLICITUD COTIZACIÓN B2B - REDAL FORMOSA*\n` +
      `• *Comercio:* ${formData.razonSocial || "No especificado"}\n` +
      `• *Tipo:* ${formData.tipoComercio}\n` +
      `• *Localidad de Entrega:* ${formData.localidadEntrega}\n` +
      `• *Contacto:* ${formData.contactoNombre} (${formData.telefonoWhatsapp})\n` +
      `• *Productos requeridos:* ${formData.productosInteres}\n` +
      `• *Volumen estimado:* ${formData.volumenEstimado}\n` +
      `• *Frecuencia:* ${formData.frecuenciaRequerida}\n` +
      `• *Detalle:* ${formData.mensajeAdicional || "Sin observaciones adicionales"}`;

    const url = `https://wa.me/5493704589214?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section
      id="solicitar-cotizacion"
      className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-10 shadow-sm"
    >
      <div className="max-w-2xl mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Formulario de Enlace Comercial
        </span>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
          Solicitar Cotización Mayorista o Convenio de Abastecimiento
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
          Completá los datos de tu comercio para coordinar entregas directas, muestras de calidad y
          acuerdos de precio por volumen con productores de la red.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-2xl">
            ✓
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            ¡Solicitud de Cotización Recibida!
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
            El equipo de articulación B2B de REDAL Formosa y los productores del rubro se pondrán
            en contacto a la brevedad con la lista de precios y condiciones de entrega.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleWhatsAppDirect}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-colors"
            >
              Agilizar envío por WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 underline"
            >
              Enviar otra consulta
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Razón social */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nombre de Fantasía o Razón Social *
              </label>
              <input
                type="text"
                required
                placeholder="ej: Restaurante El Lapacho / Verdulería Don Juan"
                value={formData.razonSocial}
                onChange={(e) =>
                  setFormData({ ...formData, razonSocial: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Tipo de comercio */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Tipo de Establecimiento *
              </label>
              <select
                value={formData.tipoComercio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipoComercio: e.target.value as BusinessType,
                  })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="restaurante_gastronomico">
                  Restaurante / Bar / Gastronomía
                </option>
                <option value="verduleria_fruteria">
                  Verdulería / Frutería Comercial
                </option>
                <option value="supermercado_autoservicio">
                  Supermercado / Autoservicio Barrial
                </option>
                <option value="hotel_catering">Hotel / Empresa de Catering</option>
                <option value="distribuidor_mayorista">Distribuidor Mayorista</option>
                <option value="institucional_comedor">Comedor Institucional / Escolar</option>
              </select>
            </div>

            {/* Localidad */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Localidad de Entrega en Formosa *
              </label>
              <select
                value={formData.localidadEntrega}
                onChange={(e) =>
                  setFormData({ ...formData, localidadEntrega: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Formosa Capital">Formosa Capital</option>
                <option value="Clorinda">Clorinda</option>
                <option value="Pirané">Pirané</option>
                <option value="El Colorado">El Colorado</option>
                <option value="Laguna Naineck">Laguna Naineck</option>
                <option value="Ibarreta">Ibarreta</option>
                <option value="Las Lomitas">Las Lomitas</option>
                <option value="Otra localidad">Otra localidad provincial</option>
              </select>
            </div>

            {/* CUIT opcional */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                CUIT (Opcional para facturación)
              </label>
              <input
                type="text"
                placeholder="ej: 30-12345678-9"
                value={formData.cuitOpcional}
                onChange={(e) =>
                  setFormData({ ...formData, cuitOpcional: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Nombre de contacto */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Persona de Contacto *
              </label>
              <input
                type="text"
                required
                placeholder="Nombre y apellido"
                value={formData.contactoNombre}
                onChange={(e) =>
                  setFormData({ ...formData, contactoNombre: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Teléfono WhatsApp *
              </label>
              <input
                type="tel"
                required
                placeholder="ej: 3704 12-3456"
                value={formData.telefonoWhatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, telefonoWhatsapp: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Requerimientos de producto y volumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Productos de Mayor Interés *
              </label>
              <input
                type="text"
                required
                placeholder="ej: Mandioca fresca, Tomates, Acelga, Batata, Miel"
                value={formData.productosInteres}
                onChange={(e) =>
                  setFormData({ ...formData, productosInteres: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Volumen Estimado Requerido *
              </label>
              <input
                type="text"
                required
                placeholder="ej: 5 a 10 cajones semanales / 150 kg de mandioca"
                value={formData.volumenEstimado}
                onChange={(e) =>
                  setFormData({ ...formData, volumenEstimado: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Mensaje extra */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Observaciones o requerimientos de entrega
            </label>
            <textarea
              rows={3}
              placeholder="Días preferidos de recepción, horario de descarga, necesidades de calibre o envasado..."
              value={formData.mensajeAdicional}
              onChange={(e) =>
                setFormData({ ...formData, mensajeAdicional: e.target.value })
              }
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95"
            >
              Enviar Solicitud de Cotización
            </button>
            <button
              type="button"
              onClick={handleWhatsAppDirect}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-5 py-3 text-xs font-bold transition-all"
            >
              Consultar por WhatsApp directamente
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
