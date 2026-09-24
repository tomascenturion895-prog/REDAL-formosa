"use client";

import { useState } from "react";
import { updateProfileField } from "@/lib/supabase/db-helpers";

interface BankFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function BankForm({ userId, onSuccess }: BankFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cbu: "",
    banco: "",
    titular: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formData.cbu.length !== 22) {
        throw new Error("El CBU debe tener 22 dígitos");
      }

      const bankData = JSON.stringify({
        cbu: formData.cbu,
        banco: formData.banco,
        titular: formData.titular,
        creado: new Date().toISOString(),
      });

      const { error: err } = await updateProfileField(userId, "bank_account", bankData);
      if (err) throw err;
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar datos bancarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-heading">Datos bancarios para transferencias</h3>
      <p className="text-sm text-muted">
        Los fondos de tus ventas se transferirán a esta cuenta.
      </p>

      {error && (
        <div className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="banco" className="block text-sm font-medium text-foreground mb-1">
          Banco
        </label>
        <select
          id="banco"
          name="banco"
          value={formData.banco}
          onChange={handleChange}
          required
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Seleccionar banco</option>
          <option value="santander">Santander</option>
          <option value="galicia">Galicia</option>
          <option value="bbva">BBVA</option>
          <option value="macro">Macro</option>
          <option value="bna">Banco Nación</option>
          <option value="provincia">Banco Provincia</option>
          <option value="icbc">ICBC</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="cbu" className="block text-sm font-medium text-foreground mb-1">
          CBU (22 dígitos)
        </label>
        <input
          id="cbu"
          type="text"
          name="cbu"
          value={formData.cbu}
          onChange={handleChange}
          required
          placeholder="0170001234567890123456"
          maxLength={22}
          pattern="[0-9]{22}"
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 font-mono text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="titular" className="block text-sm font-medium text-foreground mb-1">
          Titular de la cuenta
        </label>
        <input
          id="titular"
          type="text"
          name="titular"
          value={formData.titular}
          onChange={handleChange}
          required
          placeholder="Tu nombre completo"
          className="w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-foreground placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="rounded-control bg-info-soft px-4 py-3 text-sm text-info">
        <p className="font-medium">Seguridad</p>
        <p>Tus datos bancarios están encriptados y protegidos.</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-control bg-action px-5 py-2.5 font-medium text-on-action transition-colors duration-150 ease-soft hover:bg-action-hover disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar datos bancarios"}
      </button>
    </form>
  );
}
