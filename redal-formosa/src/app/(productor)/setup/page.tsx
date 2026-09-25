"use client";

import { useState } from "react";
import Link from "next/link";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { useAsync } from "@/lib/hooks/use-async";
import { producerRepository } from "@/lib/producer/producer-repository";
import { ProductorForm } from "@/components/productor/productor-form";
import { SucursalesForm } from "@/components/productor/sucursales-form";
import { BiometricVerification } from "@/components/productor/biometric-verification";
import { BankForm } from "@/components/productor/bank-form";
import { CheckIcon } from "@/components/ui/icons";

type Step = "info" | "ubicacion" | "biometric" | "bank" | "complete";

const STEPS: { key: Exclude<Step, "complete">; title: string; description: string }[] = [
  { key: "info", title: "Tu emprendimiento", description: "Contanos qué producís." },
  { key: "ubicacion", title: "Ubicación y horarios", description: "Para que sepan dónde y cuándo encontrarte." },
  { key: "biometric", title: "Verificación de identidad", description: "Subí tu DNI y una selfie." },
  { key: "bank", title: "Datos para cobrar", description: "La cuenta donde vas a recibir tus ventas." },
];

export default function ProductorSetupPage() {
  const { user, pending } = useRequireAuth();

  // Si ya creó su emprendimiento, el asistente sigue desde el paso siguiente (sin duplicarlo).
  const { data: existingId, loading } = useAsync(() => producerRepository.firstEmprendimientoId(user!.id), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });

  const [step, setStep] = useState<Step | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  if (pending || loading || !user) return <div aria-busy="true" className="h-40" />;

  const emprendimientoId = createdId ?? existingId ?? null;
  const currentStep: Step = step ?? (emprendimientoId ? "ubicacion" : "info");
  const index = STEPS.findIndex((s) => s.key === currentStep);
  const current = STEPS[index];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-title pb-6">Sumá tu emprendimiento</h1>

      {currentStep !== "complete" && (
        <ol className="mb-6 flex gap-2" aria-label="Progreso">
          {STEPS.map((s, i) => (
            <li key={s.key} aria-current={i === index ? "step" : undefined} className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-action" : "bg-border"}`}>
              <span className="sr-only">{s.title}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="card p-6 shadow-card">
        {currentStep !== "complete" && (
          <>
            <p className="text-sm text-muted">
              Paso {index + 1} de {STEPS.length}
            </p>
            <h2 className="text-heading mt-1">{current.title}</h2>
            <p className="mb-6 mt-1 text-sm text-muted">{current.description}</p>
          </>
        )}

        {currentStep === "info" && (
          <ProductorForm
            userId={user.id}
            defaultEmail={user.email ?? ""}
            onSuccess={(id) => {
              setCreatedId(id);
              setStep("ubicacion");
            }}
          />
        )}

        {currentStep === "ubicacion" && emprendimientoId && (
          <SucursalesForm emprendimientoId={emprendimientoId} onSuccess={() => setStep("biometric")} />
        )}

        {currentStep === "biometric" && <BiometricVerification userId={user.id} onSuccess={() => setStep("bank")} />}

        {currentStep === "bank" && <BankForm onSuccess={() => setStep("complete")} />}

        {currentStep === "complete" && (
          <div className="space-y-4 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckIcon size={28} />
            </span>
            <h2 className="text-title">Tu emprendimiento está creado</h2>
            <p className="text-muted">
              Ya podés cargar productos. Los nuevos productos se publican cuando un administrador los aprueba, y te avisamos cuando se confirme tu verificación de identidad.
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Cargar mis productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
