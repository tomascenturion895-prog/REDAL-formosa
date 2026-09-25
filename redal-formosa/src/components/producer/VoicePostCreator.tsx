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

  useEffect(() => {
    return () => cleanupAudio();
  }, []);

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

        const formData = new FormData();
        formData.append("audio", blob, "audio.webm");

        const res = await fetch("/api/assemblyai/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Error en la transcripción");

        const data = await res.json();
        if (data.text) {
          setContent((prev) => (prev ? prev + " " + data.text : data.text));
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
        desiredSampRate: 16000
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
          className={`w-full min-h-[100px] resize-none rounded-lg bg-surface-muted p-4 pr-14 text-sm outline-none transition-all focus:ring-2 focus:ring-action/20 ${
            isRecording ? "border-action ring-2 ring-action/30" : "border border-border"
          } ${isProcessing || isPublishing ? "opacity-70 cursor-not-allowed" : ""}`}
        />
        
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isProcessing || isPublishing}
          title={isRecording ? "Detener grabación" : "Dictar por voz"}
          className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
            isRecording 
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
