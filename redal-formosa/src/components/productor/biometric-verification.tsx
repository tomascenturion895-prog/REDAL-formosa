"use client";

import { useState } from "react";

import { producerRepository, type IdentityDocument } from "@/lib/producer/producer-repository";
import { Alert } from "@/components/ui/alert";
import { CheckIcon } from "@/components/ui/icons";

interface BiometricVerificationProps {
  userId: string;
  onSuccess?: () => void;
}

const DOCUMENTS: { kind: IdentityDocument; label: string }[] = [
  { kind: "dni_frente", label: "DNI, frente" },
  { kind: "dni_reverso", label: "DNI, dorso" },
  { kind: "selfie", label: "Selfie con buena luz" },
];

export function BiometricVerification({ userId, onSuccess }: BiometricVerificationProps) {
  const [uploaded, setUploaded] = useState<Partial<Record<IdentityDocument, boolean>>>({});
  const [busy, setBusy] = useState<IdentityDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (kind: IdentityDocument, file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(kind);
    try {
      await producerRepository.saveIdentityDocument(userId, kind, file);
      setUploaded((prev) => ({ ...prev, [kind]: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos subir el archivo. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  };

  const complete = DOCUMENTS.every(({ kind }) => uploaded[kind]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Subí fotos claras de tu DNI y una selfie. Solo vos y el equipo de RedAL pueden verlas.</p>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="space-y-4">
        {DOCUMENTS.map(({ kind, label }) => (
          <div key={kind}>
            <label htmlFor={kind} className="mb-1 flex items-center gap-2 text-sm font-medium">
              {label}
              {uploaded[kind] && (
                <span className="inline-flex items-center gap-1 text-success">
                  <CheckIcon size={16} /> Subido
                </span>
              )}
            </label>
            <input
              id={kind}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy !== null}
              onChange={(e) => upload(kind, e.target.files?.[0])}
              className="field text-sm file:mr-3 file:rounded-control file:border-0 file:bg-action file:px-3 file:py-1 file:font-medium file:text-on-action"
            />
          </div>
        ))}
      </div>

      <Alert tone="info">Nuestro equipo revisa los documentos y te avisa cuando la verificación esté lista.</Alert>

      {complete && (
        <button type="button" onClick={onSuccess} className="btn btn-primary w-full !py-3">
          Continuar
        </button>
      )}
    </div>
  );
}
