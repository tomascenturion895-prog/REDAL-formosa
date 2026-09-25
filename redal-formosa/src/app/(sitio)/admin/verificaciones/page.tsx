"use client";

import { useState } from "react";

import { adminRepository, type PendingVerification } from "@/lib/admin/admin-repository";
import { useAsync } from "@/lib/hooks/use-async";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckIcon, ShieldIcon } from "@/components/ui/icons";

const DOCUMENTS = [
  { key: "dni_frente_url", label: "DNI, frente" },
  { key: "dni_reverso_url", label: "DNI, dorso" },
  { key: "selfie_url", label: "Selfie" },
] as const;

/** Abre un documento del bucket privado con un enlace que vence a los 5 minutos. */
function DocumentLink({ path, label }: { path: string; label: string }) {
  const [opening, setOpening] = useState(false);
  const [failed, setFailed] = useState(false);

  const open = async () => {
    setOpening(true);
    setFailed(false);
    try {
      window.open(await adminRepository.documentUrl(path), "_blank", "noopener,noreferrer");
    } catch {
      setFailed(true);
    } finally {
      setOpening(false);
    }
  };

  return (
    <button type="button" onClick={open} disabled={opening} aria-busy={opening} className="btn btn-secondary btn-sm">
      {failed ? "No se pudo abrir" : label}
    </button>
  );
}

export default function VerificacionesPage() {
  const { data: pending, error: loadError, reload } = useAsync(() => adminRepository.pendingVerifications(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decide = async (item: PendingVerification, approve: boolean) => {
    setBusy(item.id);
    setError(null);
    try {
      await adminRepository.reviewVerification(item.id, approve, approve ? undefined : reason.trim());
      setRejecting(null);
      setReason("");
      reload();
    } catch {
      setError("No se pudo guardar la decisión. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return <Alert tone="error">No pudimos cargar las verificaciones pendientes.</Alert>;
  if (!pending) return <div aria-busy="true" className="h-40" />;

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={<CheckIcon size={36} />}
        title="No hay verificaciones para revisar"
        description="Cuando un vendedor suba su DNI y su selfie, aparece acá."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <Alert tone="info">
        Compará el rostro de la selfie con la foto del DNI y que los datos sean legibles. Los enlaces a los documentos vencen a los 5 minutos.
      </Alert>

      <ul className="space-y-4">
        {pending.map((item) => (
          <li key={item.id} className="card space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <ShieldIcon size={18} className="text-action" />
                  {item.full_name ?? "Sin nombre"}
                </h3>
                <p className="text-sm text-muted">
                  {item.email}
                  {item.emprendimiento_nombre && <> · {item.emprendimiento_nombre}</>}
                </p>
              </div>
              <p className="text-xs text-muted">Enviado el {new Date(item.created_at).toLocaleDateString("es-AR")}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {DOCUMENTS.map(({ key, label }) => (
                <DocumentLink key={key} path={item[key]} label={label} />
              ))}
            </div>

            {rejecting === item.id ? (
              <div className="space-y-3">
                <label htmlFor={`motivo-${item.id}`} className="block text-sm font-medium">
                  Motivo del rechazo (se lo mostramos a la persona)
                </label>
                <textarea
                  id={`motivo-${item.id}`}
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: la selfie está desenfocada, volvé a subirla con buena luz"
                  className="field"
                />
                <div className="flex gap-2">
                  <button type="button" disabled={busy === item.id || !reason.trim()} onClick={() => decide(item, false)} className="btn btn-danger btn-sm">
                    Confirmar rechazo
                  </button>
                  <button type="button" onClick={() => setRejecting(null)} className="btn btn-ghost btn-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" disabled={busy === item.id} aria-busy={busy === item.id} onClick={() => decide(item, true)} className="btn btn-primary btn-sm">
                  Aprobar identidad
                </button>
                <button type="button" disabled={busy === item.id} onClick={() => setRejecting(item.id)} className="btn btn-secondary btn-sm">
                  Rechazar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
