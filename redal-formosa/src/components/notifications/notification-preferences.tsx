"use client";

import { useEffect, useState } from "react";
import { notificationsService } from "@/lib/notifications/notifications-service";
import { useAuth } from "@/lib/auth/auth-context";

export function NotificationPreferences() {
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState({
    email_confirmacion: true,
    email_estado_pedido: true,
    email_ofertas: true,
    sms_confirmacion: false,
    sms_estado_pedido: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    try {
      const prefs = await notificationsService.getPreferences(user.id);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (err) {
      setError("Error cargando preferencias");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const success = await notificationsService.updatePreferences(
        user.id,
        preferences
      );

      if (success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Error guardando preferencias");
      }
    } catch (err) {
      setError("Error al guardar preferencias");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="text-center text-muted">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-control bg-info-soft p-4 text-sm text-info">
        Debes estar logueado para cambiar preferencias
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="text-heading mb-4">📧 Notificaciones por Email</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_confirmacion}
              onChange={() => handleToggle("email_confirmacion")}
              className="w-5 h-5 rounded"
            />
            <span className="text-foreground">
              Confirmación de pedidos
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_estado_pedido}
              onChange={() => handleToggle("email_estado_pedido")}
              className="w-5 h-5 rounded"
            />
            <span className="text-foreground">
              Actualizaciones de estado
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_ofertas}
              onChange={() => handleToggle("email_ofertas")}
              className="w-5 h-5 rounded"
            />
            <span className="text-foreground">
              Ofertas y promociones
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="text-heading mb-4">📱 Notificaciones por SMS</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.sms_confirmacion}
              onChange={() => handleToggle("sms_confirmacion")}
              className="w-5 h-5 rounded"
            />
            <span className="text-foreground">
              Confirmación de pedidos
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.sms_estado_pedido}
              onChange={() => handleToggle("sms_estado_pedido")}
              className="w-5 h-5 rounded"
            />
            <span className="text-foreground">
              Actualizaciones de estado
            </span>
          </label>

          <p className="text-xs text-muted mt-3">
            Nota: Podría aplicarse tarifa de SMS según tu operador
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-control bg-success-soft px-4 py-3 text-sm text-success">
          ✓ Preferencias guardadas correctamente
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-control bg-action px-4 py-3 font-medium text-on-action hover:bg-action-hover disabled:opacity-60 transition-colors"
      >
        {loading ? "Guardando..." : "Guardar preferencias"}
      </button>
    </div>
  );
}
