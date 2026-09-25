"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export type RecorderStatus = "idle" | "recording";

interface Options {
  maxSeconds?: number;
  onRecorded: (audio: Blob) => void;
  onError: (message: string) => void;
}

/** Graba audio del micrófono con MediaRecorder y lo entrega al terminar. Corta solo al llegar al máximo. */
export function useVoiceRecorder({ maxSeconds = 30, onRecorded, onError }: Options) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbacks = useRef({ onRecorded, onError });

  useEffect(() => {
    callbacks.current = { onRecorded, onError };
  });

  const release = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    recorder.current = null;
    setStatus("idle");
    setSeconds(0);
  }, []);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      callbacks.current.onError("Tu navegador no permite grabar audio.");
      return;
    }

    let media: MediaStream;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      callbacks.current.onError("No pudimos usar el micrófono. Permitilo desde el candado de la barra de direcciones.");
      return;
    }

    const mimeType = MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
    const rec = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];

    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    rec.onstop = () => {
      const audio = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" });
      release();
      callbacks.current.onRecorded(audio);
    };

    stream.current = media;
    recorder.current = rec;
    rec.start();
    setStatus("recording");
    setSeconds(0);

    const startedAt = Date.now();
    timer.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(elapsed);
      if (elapsed >= maxSeconds) stop();
    }, 250);
  }, [maxSeconds, release, stop]);

  // Si la persona sale de la pantalla mientras graba, se suelta el micrófono sin entregar audio.
  useEffect(
    () => () => {
      if (recorder.current) recorder.current.onstop = null;
      if (recorder.current?.state === "recording") recorder.current.stop();
      if (timer.current) clearInterval(timer.current);
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  return { status, seconds, maxSeconds, start, stop };
}
