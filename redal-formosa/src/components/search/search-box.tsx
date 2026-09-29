"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchIcon, MicIcon } from "@/components/ui/icons";

export function SearchBox({ placeholder = "Buscar productos", id = "header-search" }: { placeholder?: string; id?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params?.get("q") ?? "");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Limpiar recursos si el componente se desmonta
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/productos?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/productos");
    }
  };

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

        // Enviar al servidor para procesar con AssemblyAI / Whisper
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
          setQuery(data.text);
          // Auto submit con el resultado
          const q = data.text.trim();
          router.push(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
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
      setQuery("");
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      setErrorMsg("Permiso denegado o error de micrófono");
      cleanupAudio();
    }
  };

  const startVoiceSearch = async () => {
    setErrorMsg("");

    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "es-AR";
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onstart = () => {
          setIsRecording(true);
          setErrorMsg("");
          setQuery("");
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const current = finalTranscript || interimTranscript;
          if (current) {
            setQuery(current);
          }

          if (finalTranscript) {
            setIsRecording(false);
            recognitionRef.current = null;
            const q = finalTranscript.trim();
            if (q) {
              router.push(`/productos?q=${encodeURIComponent(q)}`);
            }
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
        console.warn("SpeechRecognition falló al iniciar, usando fallback de grabación:", e);
      }
    }

    await startRecordingFallback();
  };

  const toggleVoiceSearch = () => {
    if (isRecording) {
      stopVoiceSearch();
    } else {
      startVoiceSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative group">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <SearchIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isRecording ? "Hablá y volvé a hacer clic..." : isProcessing ? "Procesando..." : placeholder}
        disabled={isProcessing}
        className={`field !rounded-full !bg-surface-muted !py-2 !pl-10 !pr-10 text-sm transition-all ${isRecording ? "!border-action/50 !ring-2 !ring-action/20" : ""
          } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
      />
      <button
        type="button"
        onClick={toggleVoiceSearch}
        disabled={isProcessing}
        title={isRecording ? "Detener grabación" : "Búsqueda por voz"}
        className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${isRecording
            ? "bg-action text-on-action animate-pulse shadow-sm"
            : isProcessing
              ? "text-muted/50 cursor-not-allowed"
              : "text-muted hover:bg-surface hover:text-foreground"
          }`}
      >
        <MicIcon size={16} />
      </button>
      {errorMsg && (
        <span className="absolute -bottom-6 left-2 text-xs font-medium text-destructive">
          {errorMsg}
        </span>
      )}
    </form>
  );
}
