"use client";

import { useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { DEFAULT_PREFERENCES } from "@/lib/domain/notification-preferences";
import { useAsync } from "@/lib/hooks/use-async";
import { preferencesRepository, type NotificationPreferences } from "@/lib/notifications/preferences-repository";

const GROUPS: { title: string; note?: string; options: [keyof NotificationPreferences, string][] }[] = [
  {
    title: "Email",
    options: [
      ["email_confirmacion", "Confirmación de pedidos"],
      ["email_estado_pedido", "Cambios en el estado de tus pedidos"],
      ["email_ofertas", "Ofertas y novedades"],
    ],
  },
  {
    title: "SMS",
    note: "Puede aplicarse el costo de mensajes de tu operador. Usamos el teléfono de tu perfil.",
    options: [
      ["sms_confirmacion", "Confirmación de pedidos"],
      ["sms_estado_pedido", "Cambios en el estado de tus pedidos"],
    ],
  },
];

export function NotificationPreferences() {
  const { user } = useAuth();
  const { data: saved, loading } = useAsync(() => preferencesRepository.get(user!.id), [user?.id], {
    enabled: Boolean(user),
  });

  // Los cambios sin guardar se superponen a lo cargado.
  const [edits, setEdits] = useState<Partial<NotificationPreferences>>({});
  const prefs: NotificationPreferences = { ...DEFAULT_PREFERENCES, ...saved, ...edits };

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await preferencesRepository.save(user.id, prefs);
      setMessage({ type: "ok", text: "Guardamos tus preferencias." });
    } catch {
      setMessage({ type: "error", text: "No pudimos guardar los cambios. Intentá de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <fieldset key={group.title} className="card p-6" disabled={loading}>
          <legend className="text-heading float-left w-full pb-4">{group.title}</legend>
          <div className="clear-both space-y-4">
            {group.options.map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={() => setEdits((e) => ({ ...e, [key]: !prefs[key] }))}
                  className="h-5 w-5 rounded accent-[var(--action)]"
                />
                <span>{label}</span>
              </label>
            ))}
            {group.note && <p className="text-sm text-muted">{group.note}</p>}
          </div>
        </fieldset>
      ))}

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-control px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <button type="button" onClick={save} disabled={saving || loading} aria-busy={saving} className="btn btn-primary">
        {saving ? "Guardando…" : "Guardar preferencias"}
      </button>
    </div>
  );
}
