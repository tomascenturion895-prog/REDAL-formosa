"use client";

interface VoiceQuickAddProps {
  emprendimientoId: string;
  onCreated: () => void;
}

export function VoiceQuickAdd({ emprendimientoId, onCreated }: VoiceQuickAddProps) {
  return (
    <div className="card p-4">
      <h2 className="text-heading mb-2">Agregar producto por voz</h2>
      <p className="text-muted text-sm">
        Componente de carga rápida para el emprendimiento {emprendimientoId}.
      </p>
      <button type="button" className="btn btn-primary mt-3" onClick={onCreated}>
        Agregar producto
      </button>
    </div>
  );
}
