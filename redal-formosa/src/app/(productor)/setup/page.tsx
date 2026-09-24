"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { ProductorForm } from "@/components/productor/productor-form";
import { SucursalesForm } from "@/components/productor/sucursales-form";
import { BiometricVerification } from "@/components/productor/biometric-verification";
import { BankForm } from "@/components/productor/bank-form";

type Step = "info" | "sucursal" | "biometric" | "bank" | "complete";

export default function ProductorSetupPage() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState<Step>("info");
  const [emprendimientoId, setEmprendimientoId] = useState<string>("");

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-narrow mx-auto text-center py-12">
        <p className="text-muted">Debes estar logueado para acceder a esta página.</p>
      </div>
    );
  }

  const steps: { key: Step; title: string; description: string }[] = [
    {
      key: "info",
      title: "Información del emprendimiento",
      description: "Cuéntanos sobre tu negocio",
    },
    {
      key: "sucursal",
      title: "Ubicación y horarios",
      description: "Agrega tu localidad y horarios de atención",
    },
    {
      key: "biometric",
      title: "Verificación de identidad",
      description: "Verifica tu identidad con DNI y selfie",
    },
    {
      key: "bank",
      title: "Datos bancarios",
      description: "Información para recibir pagos",
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const currentStep = steps[currentStepIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-title mb-4">Configura tu emprendimiento</h1>
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`flex-1 h-1 rounded-full transition-colors duration-200 ${
                i <= currentStepIndex ? "bg-action" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="text-heading mb-2">{currentStep.title}</h2>
        <p className="text-sm text-muted mb-6">{currentStep.description}</p>

        {step === "info" && (
          <ProductorForm
            userId={user.id}
            onSuccess={() => {
              setStep("sucursal");
            }}
          />
        )}

        {step === "sucursal" && (
          <SucursalesForm
            emprendimientoId={user.id}
            onSuccess={() => {
              setStep("biometric");
            }}
          />
        )}

        {step === "biometric" && (
          <BiometricVerification
            userId={user.id}
            onSuccess={() => {
              setStep("bank");
            }}
          />
        )}

        {step === "bank" && (
          <BankForm
            userId={user.id}
            onSuccess={() => {
              setStep("complete");
            }}
          />
        )}

        {step === "complete" && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-heading">¡Felicitaciones!</h3>
            <p className="text-muted">
              Tu emprendimiento está listo. Próximamente recibirás la confirmación de la
              verificación de identidad.
            </p>
            <a
              href="/dashboard/productor"
              className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover"
            >
              Ir al panel
            </a>
          </div>
        )}
      </div>

      {step !== "complete" && (
        <div className="mt-4 text-center text-sm text-muted">
          Paso {currentStepIndex + 1} de {steps.length}
        </div>
      )}
    </div>
  );
}
