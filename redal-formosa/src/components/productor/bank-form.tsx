"use client";

import { useState } from "react";

import { BANKS, isBankCode } from "@/lib/domain/banks";
import { isValidCbu } from "@/lib/domain/cbu";
import { saveBankAccount } from "@/lib/producer/bank-account-client";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

interface BankFormProps {
  onSuccess?: () => void;
}

export function BankForm({ onSuccess }: BankFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ cbu: "", banco: "", titular: "" });

  const update =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidCbu(form.cbu)) {
      setError("El CBU no es válido. Revisá que tenga 22 dígitos y que estén bien cargados.");
      return;
    }

    if (!isBankCode(form.banco)) return;

    setLoading(true);
    try {
      // El servidor valida de nuevo y guarda la cuenta cifrada.
      await saveBankAccount({ cbu: form.cbu, banco: form.banco, titular: form.titular.trim() });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar tus datos bancarios. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <Field id="banco" label="Banco">
        <select id="banco" required value={form.banco} onChange={update("banco")} className="field">
          <option value="">Elegí tu banco</option>
          {BANKS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="cbu" label="CBU" hint="22 dígitos, sin espacios.">
        <input
          id="cbu"
          required
          inputMode="numeric"
          value={form.cbu}
          onChange={update("cbu")}
          placeholder="0170001234567890123456"
          maxLength={22}
          pattern="[0-9]{22}"
          className="field font-mono"
        />
      </Field>

      <Field id="titular" label="Titular de la cuenta">
        <input id="titular" required value={form.titular} onChange={update("titular")} placeholder="Nombre completo" className="field" />
      </Field>

      <Alert tone="info">Solo vos y el equipo de RedAL pueden ver estos datos. Los usamos para transferirte tus ventas.</Alert>

      <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full !py-3">
        {loading ? "Guardando…" : "Guardar datos bancarios"}
      </button>
    </form>
  );
}
