"use client";

import { useState } from "react";

import { useVoiceRecorder } from "@/lib/audio/use-voice-recorder";
import { useAsync } from "@/lib/hooks/use-async";
import { cleanNovedad, NOVEDAD_MAX_CHARS } from "@/lib/domain/novedad";
import { novedadesRepository } from "@/lib/novedades/novedades-repository";
import { Alert } from "@/components/ui/alert";
import { MicIcon, StopIcon, TrashIcon } from "@/components/ui/icons";

const dateFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" });

interface VoicePostCreatorProps {
  emprendimientoId: string;
}

/** El vendedor publica una novedad escribiendo o hablando, y ve y borra las que ya publicó. */
export function VoicePostCreator({ emprendimientoId }: VoicePostCreatorProps) {
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: own, reload } = useAsync(() => novedadesRepository.listFor(emprendimientoId, 5), [emprendimientoId], {
    scope: emprendimientoId,
  });

  const transcribe = async (audio: Blob) => {
    setProcessing(true);
    try {
      const body = new FormData();
      body.append("audio", audio);
      const response = await fetch("/api/assemblyai/transcribe", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.text !== "string") {
        setError(typeof data.error === "string" ? data.error : "No pudimos procesar el audio. Intentá de nuevo.");
        return;
      }
      setText((prev) => `${prev ? `${prev} ` : ""}${data.text}`.trim().slice(0, NOVEDAD_MAX_CHARS));
    } catch {
      setError("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  const { status, seconds, maxSeconds, start, stop } = useVoiceRecorder({ onRecorded: transcribe, onError: setError });
  const recording = status === "recording";

  const toggle = () => {
    setError(null);
    if (recording) stop();
    else void start();
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let contenido: string;
    try {
      contenido = cleanNovedad(text);
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    setPublishing(true);
    try {
      await novedadesRepository.publish(emprendimientoId, contenido);
      setText("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos publicar la novedad. Intentá de nuevo.");
    } finally {
      setPublishing(false);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await novedadesRepository.remove(id);
      reload();
    } catch {
      setError("No pudimos borrar la novedad. Intentá de nuevo.");
    }
  };

  return (
    <section aria-labelledby="novedades-vendedor-title" className="card space-y-4 p-5 sm:p-6">
      <div>
        <h2 id="novedades-vendedor-title" className="text-heading">
          Novedades para tus compradores
        </h2>
        <p className="mt-1 text-sm text-muted">Avisá qué cosechaste hoy o si cambia tu horario. Se ve en el inicio de REDAL.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={publish} className="space-y-3">
        <label className="block text-sm font-medium">
          Tu novedad
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={NOVEDAD_MAX_CHARS}
            rows={3}
            placeholder="Ej: Hoy llegó zapallo fresco de la quinta."
            className="field mt-1"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            disabled={processing}
            aria-busy={processing}
            aria-pressed={recording}
            className={`btn btn-secondary ${recording ? "btn-danger" : ""}`}
          >
            {recording ? <StopIcon size={18} /> : !processing && <MicIcon size={18} />}
            {processing ? "Procesando…" : recording ? `Terminar (${seconds}s / ${maxSeconds}s)` : "Dictar"}
          </button>
          <button type="submit" className="btn btn-primary" disabled={publishing || processing || recording || !text.trim()}>
            {publishing ? "Publicando…" : "Publicar"}
          </button>
          <span className="ml-auto text-xs tabular-nums text-muted">
            {text.length}/{NOVEDAD_MAX_CHARS}
          </span>
        </div>
      </form>

      {own && own.length > 0 && (
        <ul className="divide-y divide-border border-t border-border text-sm">
          {own.map((novedad) => (
            <li key={novedad.id} className="flex items-start gap-3 py-3">
              <p className="min-w-0 flex-1">
                «{novedad.contenido}»
                <span className="ml-2 text-xs text-muted">{dateFormat.format(new Date(novedad.createdAt))}</span>
              </p>
              <button type="button" onClick={() => remove(novedad.id)} aria-label="Borrar novedad" className="btn btn-ghost btn-sm shrink-0">
                <TrashIcon size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
