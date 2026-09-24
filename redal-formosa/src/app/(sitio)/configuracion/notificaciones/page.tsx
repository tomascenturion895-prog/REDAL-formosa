"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";
import { PageHeader } from "@/components/layout/page-header";

export default function NotificationsSettingsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-container py-section">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container py-section">
        <div className="text-center">
          <p className="text-muted mb-4">Debes estar logueado</p>
          <a
            href="/login"
            className="inline-block rounded-control bg-action px-6 py-3 font-medium text-on-action hover:bg-action-hover"
          >
            Ir a login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <PageHeader
        title="Notificaciones"
        description="Configura cómo deseas recibir actualizaciones"
      />

      <div className="max-w-2xl mx-auto">
        <NotificationPreferences />

        <div className="mt-8 rounded-card border border-border bg-surface-muted p-6">
          <h3 className="text-heading mb-3">ℹ️ ¿Qué es esto?</h3>
          <ul className="space-y-2 text-sm text-muted list-disc list-inside">
            <li><strong>Email:</strong> Recibe confirmaciones y actualizaciones por correo</li>
            <li><strong>SMS:</strong> Recibe mensajes de texto para alertas urgentes</li>
            <li><strong>Ofertas:</strong> Entérate de descuentos y promociones especiales</li>
          </ul>
        </div>

        <div className="mt-4 rounded-card border border-border bg-surface-muted p-6">
          <h3 className="text-heading mb-3">🔒 Privacidad</h3>
          <p className="text-sm text-muted">
            Nunca compartimos tu información con terceros. Tus datos están seguros con nosotros.
          </p>
        </div>
      </div>
    </div>
  );
}
