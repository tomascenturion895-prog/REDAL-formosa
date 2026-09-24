"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BiometricVerificationProps {
  userId: string;
  onSuccess?: () => void;
}

export function BiometricVerification({ userId, onSuccess }: BiometricVerificationProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    dni_frente?: boolean;
    dni_reverso?: boolean;
    selfie?: boolean;
  }>({});

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "dni_frente" | "dni_reverso" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from("biometric-verification")
        .upload(fileName, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      setUploadStatus((prev) => ({ ...prev, [type]: true }));

      // Guardar URL en la BD
      const { data: publicData } = supabase.storage
        .from("biometric-verification")
        .getPublicUrl(fileName);

      await supabase
        .from("validacion_biometrica")
        .upsert({
          user_id: userId,
          [type === "dni_frente" ? "dni_frente_url" : type === "dni_reverso" ? "dni_reverso_url" : "selfie_url"]:
            publicData.publicUrl,
          estado: "pendiente",
        } as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-heading">Verificación de identidad</h3>
      <p className="text-sm text-muted">
        Necesitamos verificar tu identidad. Sube fotos claras de tu DNI y una selfie.
      </p>

      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            DNI - Lado frontal {uploadStatus.dni_frente && "✓"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "dni_frente")}
            disabled={loading}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground file:mr-3 file:rounded-control file:border-0 file:bg-action file:px-3 file:py-1 file:text-on-action file:font-medium file:cursor-pointer hover:file:bg-action-hover disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            DNI - Lado trasero {uploadStatus.dni_reverso && "✓"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "dni_reverso")}
            disabled={loading}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground file:mr-3 file:rounded-control file:border-0 file:bg-action file:px-3 file:py-1 file:text-on-action file:font-medium file:cursor-pointer hover:file:bg-action-hover disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Selfie (con buen iluminación) {uploadStatus.selfie && "✓"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "selfie")}
            disabled={loading}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground file:mr-3 file:rounded-control file:border-0 file:bg-action file:px-3 file:py-1 file:text-on-action file:font-medium file:cursor-pointer hover:file:bg-action-hover disabled:opacity-60"
          />
        </div>
      </div>

      <div className="rounded-control bg-info-soft px-4 py-3 text-sm text-info">
        <p className="font-medium">Verificación pendiente</p>
        <p>Nuestro equipo revisará tus documentos en las próximas 24 horas.</p>
      </div>

      {uploadStatus.dni_frente && uploadStatus.dni_reverso && uploadStatus.selfie && (
        <button
          onClick={onSuccess}
          className="w-full rounded-control bg-success px-5 py-2.5 font-medium text-on-success transition-colors duration-150 ease-soft hover:bg-success-hover"
        >
          Continuar
        </button>
      )}
    </div>
  );
}
