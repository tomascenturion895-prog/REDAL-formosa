"use client";

import { useState } from "react";

import { useVoiceRecorder } from "@/lib/audio/use-voice-recorder";
import type { VoiceProductDraft } from "@/lib/domain/voice-product";
import { Alert } from "@/components/ui/alert";
import { MicIcon, StopIcon } from "@/components/ui/icons";

interface VoiceToProductProps {
  onDraft: (draft: VoiceProductDraft, transcript: string) => void;
}

/** Botón de micrófono: el vendedor dice qué tiene y el formulario se pre-llena. */
export function VoiceToProduct({ onDraft }: VoiceToProductProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  const send = async (audio: Blob) => {
    setProcessing(true);
    try {
      const body = new FormData();
      body.append("audio", audio);
      const response = await fetch("/api/producer/voice-to-product", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "No pudimos procesar el audio. Intentá de nuevo.");
        return;
      }
      setTranscript(data.transcript);
      onDraft(data.draft, data.transcript);
    } catch {
      setError("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  const { status, seconds, maxSeconds, start, stop } = useVoiceRecorder({
    onRecorded: send,
    onError: setError,
  });
  const recording = status === "recording";

  const toggle = () => {
    setError(null);
    if (recording) stop();
    else {
      setTranscript(null);
      void start();
    }
  };

  return (
    <div className="space-y-3 rounded-card border border-dashed border-border-strong bg-surface-muted/50 p-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={processing}
          aria-busy={processing}
          aria-pressed={recording}
          className={`btn shrink-0 !rounded-full !px-5 ${recording ? "btn-danger" : "btn-primary"}`}
        >
          {recording ? <StopIcon size={18} /> : !processing && <MicIcon size={18} />}
          {processing ? "Procesando…" : recording ? "Terminar" : "Hablar"}
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {recording ? (
            <>
              Escuchando… <span className="tabular-nums">{seconds}s / {maxSeconds}s</span>
            </>
          ) : processing ? (
            "Estamos armando tu producto."
          ) : (
            "Decí qué vendés, cuánto tenés y a qué precio. Ej: «Tengo 10 kilos de zapallo a 1000 pesos»."
          )}
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {transcript && !error && (
        <Alert tone="success">
          Escuchamos: «{transcript}». Revisá los datos antes de guardar.
        </Alert>
      )}
    </div>
  );
}
