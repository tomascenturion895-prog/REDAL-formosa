import type { Metadata } from "next";

import { CheckoutStepper } from "@/components/payment/checkout-stepper";
import { MercadoPagoBadge } from "@/components/payment/mercadopago-badge";
import { OrderProgress } from "@/components/payment/order-progress";
import { PaymentMethods } from "@/components/payment/payment-methods";

export const metadata: Metadata = { title: "Guía de estilo" };

const scales = [
  { name: "primary", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "accent", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "neutral", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
] as const;

const semantic = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["surface-muted", "bg-surface-muted"],
  ["action", "bg-action"],
  ["highlight", "bg-highlight"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
  ["info", "bg-info"],
] as const;

const sizes = [
  ["text-display", "text-display"],
  ["text-title", "text-title"],
  ["text-heading", "text-heading"],
  ["text-xl", "text-xl"],
  ["text-lg", "text-lg"],
  ["text-base", "text-base"],
  ["text-sm", "text-sm"],
  ["text-xs", "text-xs"],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8 border-b border-border">
      <h2 className="text-heading mb-5">{title}</h2>
      {children}
    </section>
  );
}

export default function GuiaDeEstilo() {
  return (
    <div className="page-container py-section">
      <h1 className="text-display">Guía de estilo</h1>
      <p className="mt-3 max-w-prose text-muted">
        Tokens globales de RedAL Formosa. Definidos en{" "}
        <code className="rounded-control bg-surface-muted px-1.5 py-0.5 text-sm">
          src/app/globals.css
        </code>
        .
      </p>

      <Section title="Colores semánticos (usar estos en componentes)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {semantic.map(([name, cls]) => (
            <div key={name} className="rounded-card border border-border bg-surface p-2 shadow-card">
              <div className={`h-12 rounded-control border border-border ${cls}`} />
              <p className="mt-2 text-sm font-medium">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Escalas">
        <div className="space-y-4">
          {scales.map(({ name, steps }) => (
            <div key={name}>
              <p className="mb-1.5 text-sm font-medium">{name}</p>
              <div className="grid grid-cols-11 overflow-hidden rounded-control">
                {steps.map((s) => (
                  <div
                    key={s}
                    className="h-10"
                    style={{ background: `var(--color-${name}-${s})` }}
                    title={`${name}-${s}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografía">
        <p className="mb-4 text-sm text-muted">
          Títulos: Fraunces (font-display, automático en h1–h4). Texto: Figtree (font-sans).
        </p>
        <div className="space-y-3">
          {sizes.map(([label, cls]) => (
            <div key={label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
              <code className="w-28 shrink-0 text-xs text-muted">{label}</code>
              <p className={`${cls} ${cls === "text-display" || cls === "text-title" || cls === "text-heading" ? "font-display" : ""}`}>
                Miel de caña, chipá y artesanías
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 font-display text-title tabular-nums">
          {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(12500)}
        </p>
      </Section>

      <Section title="Componentes base">
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-control bg-action px-5 py-2.5 font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover">
            Contactar
          </button>
          <button className="rounded-control bg-highlight px-5 py-2.5 font-medium text-on-highlight">
            Destacado
          </button>
          <button className="rounded-control border border-border-strong bg-surface px-5 py-2.5 font-medium">
            Secundario
          </button>
          <button disabled className="rounded-control bg-surface-muted px-5 py-2.5 font-medium text-muted opacity-60">
            Deshabilitado
          </button>
          <a href="#" className="font-medium text-link underline underline-offset-4">
            Enlace
          </a>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
          <span className="rounded-full bg-success-soft px-3 py-1 text-success">Disponible</span>
          <span className="rounded-full bg-warning-soft px-3 py-1 text-warning">Pocas unidades</span>
          <span className="rounded-full bg-danger-soft px-3 py-1 text-danger">Sin stock</span>
          <span className="rounded-full bg-info-soft px-3 py-1 text-info">Nuevo</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h3 className="text-heading">Tarjeta</h3>
            <p className="mt-1 text-muted">rounded-card + shadow-card</p>
          </div>
          <div className="rounded-sheet bg-surface p-5 shadow-pop">
            <h3 className="text-heading">Panel / modal</h3>
            <p className="mt-1 text-muted">rounded-sheet + shadow-pop</p>
          </div>
        </div>
        <input
          className="mt-6 w-full max-w-narrow rounded-control border border-border-strong bg-surface px-3 py-2.5"
          placeholder="Campo de texto (probá el foco con Tab)"
        />
      </Section>

      <Section title="Pagos">
        <div className="space-y-6">
          <MercadoPagoBadge />
          <CheckoutStepper current={1} />
          <PaymentMethods />
          <div className="card p-6">
            <OrderProgress estado="en_preparacion" />
          </div>
        </div>
      </Section>
    </div>
  );
}
