"use client";

import { useState, useRef, useEffect } from "react";
import { MicIcon } from "@/components/ui/icons";

export function VoicePostCreator() {
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => cleanupAudio();
  }, []);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
      recorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
  };

  const stopVoiceSearch = async () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
      return;
    }

    if (!recorderRef.current) return;
    setIsProcessing(true);

    recorderRef.current.stopRecording(async () => {
      try {
        const blob = recorderRef.current.getBlob();
        cleanupAudio();

        const formData = new FormData();
        formData.append("audio", blob, "audio.wav");

        const res = await fetch("/api/assemblyai/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const detail = errData?.error || errData?.details || res.statusText;
          throw new Error(detail || `Error del servidor (${res.status})`);
        }

        const data = await res.json();
        if (data.text) {
          setContent((prev) => (prev ? prev + " " + data.text : data.text));
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err?.message || "Error al procesar el audio");
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const startRecordingFallback = async () => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const RecordRTCModule = await import("recordrtc");
      const RecordRTC = RecordRTCModule.default;
      const { StereoAudioRecorder } = RecordRTCModule;

      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      setErrorMsg("Permiso denegado o error de micrófono");
      cleanupAudio();
    }
  };

  const startVoiceSearch = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "es-AR";
        recognition.continuous = false;
        recognition.interimResults = true;
        recognitionRef.current = recognition;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setContent((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("SpeechRecognition error:", event.error);
          setIsRecording(false);
          recognitionRef.current = null;
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setErrorMsg("Permiso denegado para el micrófono");
          } else if (event.error !== "no-speech") {
            void startRecordingFallback();
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          recognitionRef.current = null;
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn("SpeechRecognition falló al iniciar:", e);
      }
    }

    await startRecordingFallback();
  };

  const toggleRecording = () => {
    if (isRecording) stopVoiceSearch();
    else startVoiceSearch();
  };

  const publishPost = async () => {
    if (!content.trim()) return;
    setIsPublishing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), author: "Productor / Vendedor" })
      });

      if (!res.ok) throw new Error("Error al publicar");
      setContent("");
      setSuccessMsg("¡Publicación creada con éxito! Ya aparece en el feed principal.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Ocurrió un error al intentar publicar.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        Crear Novedad Rápida
      </h3>
      <p className="text-sm text-muted mb-4">
        Usá tu voz para contarle a tus clientes qué tenés fresco hoy.
      </p>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isRecording ? "Escuchando... hablá ahora" : isProcessing ? "Procesando voz a texto..." : "¿Qué querés contar hoy?"}
          disabled={isProcessing || isPublishing}
          className={`w-full min-h-[100px] resize-none rounded-lg bg-surface-muted p-4 pr-14 text-sm outline-none transition-all focus:ring-2 focus:ring-action/20 ${isRecording ? "border-action ring-2 ring-action/30" : "border border-border"
            } ${isProcessing || isPublishing ? "opacity-70 cursor-not-allowed" : ""}`}
        />

        <button
          type="button"
          onClick={toggleRecording}
          disabled={isProcessing || isPublishing}
          title={isRecording ? "Detener grabación" : "Dictar por voz"}
          className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-all ${isRecording
              ? "bg-action text-on-action animate-pulse shadow-md scale-110"
              : isProcessing
                ? "bg-surface-muted text-muted cursor-not-allowed"
                : "bg-surface text-muted hover:bg-action hover:text-on-action shadow-sm border border-border hover:border-transparent"
            }`}
        >
          <MicIcon size={20} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          {errorMsg && <span className="text-sm font-medium text-destructive">{errorMsg}</span>}
          {successMsg && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{successMsg}</span>}
        </div>
        <button
          onClick={publishPost}
          disabled={!content.trim() || isPublishing || isProcessing || isRecording}
          className="btn btn-primary px-6 py-2 shadow-sm disabled:opacity-50"
        >
          {isPublishing ? "Publicando..." : "Publicar Novedad"}
        </button>
      </div>
    </div>
  );
}
