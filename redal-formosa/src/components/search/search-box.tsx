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
    
    if (!recorderRef.current) return;

    setIsProcessing(true);
    
    recorderRef.current.stopRecording(async () => {
      try {
        const blob = recorderRef.current.getBlob();
        cleanupAudio();

        // Enviar al servidor para procesar con AssemblyAI
        const formData = new FormData();
        formData.append("audio", blob, "audio.webm");

        const res = await fetch("/api/assemblyai/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json().catch(() => ({}));

        // Un fallo esperable (sin clave, sin saldo, audio vacío) se muestra en pantalla, sin romper la página.
        if (!res.ok) {
          setErrorMsg(typeof data.error === "string" ? data.error : "Error al procesar el audio");
          return;
        }
        
        if (data.text) {
          setQuery(data.text);
          // Auto submit con el resultado
          const q = data.text.trim();
          router.push(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al procesar el audio");
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const startVoiceSearch = async () => {
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
        desiredSampRate: 16000
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      setQuery(""); // Clear the input for the voice transcription
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      setErrorMsg("Permiso denegado o error de micrófono");
      cleanupAudio();
    }
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
        className={`field !rounded-full !bg-surface-muted !py-2 !pl-10 !pr-10 text-sm transition-all ${
          isRecording ? "!border-action/50 !ring-2 !ring-action/20" : ""
        } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
      />
      <button
        type="button"
        onClick={toggleVoiceSearch}
        disabled={isProcessing}
        title={isRecording ? "Detener grabación" : "Búsqueda por voz"}
        className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          isRecording 
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
