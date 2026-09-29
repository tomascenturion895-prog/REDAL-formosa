"use client";

import { useState } from "react";

import { adminRepository, type PendingPayout } from "@/lib/admin/admin-repository";
import { fetchPayoutAccount } from "@/lib/admin/payout-account-client";
import { BANKS, type BankAccount } from "@/lib/domain/banks";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/use-async";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadError } from "@/components/ui/load-error";

const bankName = (code: string) => BANKS.find(([c]) => c === code)?.[1] ?? code;

function CommissionForm({ current, onSaved }: { current: number; onSaved: () => void }) {
  const [value, setValue] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = value ?? String(current);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = Number(text.replace(",", "."));
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setError("Ingresá un porcentaje entre 0 y 100.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminRepository.setCommission(pct);
      setValue(null);
      onSaved();
    } catch {
      setError("No pudimos guardar la comisión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="card flex flex-wrap items-end gap-3 p-5">
      <label className="text-sm font-medium">
        Comisión de la plataforma (%)
        <input inputMode="decimal" value={text} onChange={(e) => setValue(e.target.value)} className="field mt-1 w-32" />
      </label>
      <button type="submit" disabled={saving} aria-busy={saving} className="btn btn-secondary">
        Guardar
      </button>
      <p className="basis-full text-xs text-muted">Se aplica a lo que se liquide de ahora en más. Las liquidaciones ya hechas no cambian.</p>
      {error && <p role="alert" className="basis-full text-sm text-danger">{error}</p>}
    </form>
  );
}

function PayoutCard({ payout, onSettled }: { payout: PendingPayout; onSettled: () => void }) {
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showAccount = async () => {
    setAccountError(null);
    try {
      setAccount(await fetchPayoutAccount(payout.emprendimiento_id));
    } catch (e) {
      setAccountError(e instanceof Error ? e.message : "No pudimos obtener la cuenta.");
    }
  };

  const settle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminRepository.settlePayout(payout.emprendimiento_id, reference);
      onSettled();
    } catch {
      setError("No pudimos registrar la transferencia. Revisá el número de operación y que no se haya liquidado ya.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="card space-y-4 p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{payout.emprendimiento_nombre}</h3>
          <p className="text-sm text-muted">
            {payout.cantidad_pedidos} {payout.cantidad_pedidos === 1 ? "pedido entregado" : "pedidos entregados"}
          </p>
        </div>
        <p className="text-right">
          <span className="block text-xs text-muted">A transferir</span>
          <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(payout.monto_neto)}</span>
        </p>
      </header>

      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Ventas</dt>
          <dd className="tabular-nums">{formatPrice(payout.monto_bruto)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Comisión ({payout.comision_pct}%)</dt>
          <dd className="tabular-nums">− {formatPrice(payout.comision)}</dd>
        </div>
      </dl>

      {account ? (
        <dl className="space-y-1 rounded-control bg-surface-muted p-3 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted">Titular</dt><dd>{account.titular}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Banco</dt><dd>{bankName(account.banco)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">CBU</dt><dd className="font-mono tabular-nums">{account.cbu}</dd></div>
        </dl>
      ) : (
        <button type="button" onClick={showAccount} className="btn btn-secondary btn-sm">
          Ver datos para transferir
        </button>
      )}
      {accountError && <p role="alert" className="text-sm text-danger">{accountError}</p>}

      <form onSubmit={settle} className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <label className="min-w-0 flex-1 text-sm font-medium">
          N.º de operación de la transferencia
          <input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} className="field mt-1" />
        </label>
        <button type="submit" disabled={saving || reference.trim().length < 3} aria-busy={saving} className="btn btn-primary">
          {saving ? "Registrando…" : "Registrar transferencia"}
        </button>
        {error && <p role="alert" className="basis-full text-sm text-danger">{error}</p>}
      </form>
    </article>
  );
}

export default function AdminLiquidacionesPage() {
  const { data: payouts, error, reload } = useAsync(() => adminRepository.pendingPayouts(), []);
  const { data: commission, error: commissionError, reload: reloadCommission } = useAsync(() => adminRepository.commission(), []);

  if (error || commissionError) {
    return <LoadError title="No pudimos cargar las liquidaciones" onRetry={() => { reload(); reloadCommission(); }} />;
  }
  if (!payouts || commission === undefined) return <div aria-busy="true" className="h-40" />;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-heading">Liquidaciones a vendedores</h2>
        <p className="text-sm text-muted">
          Lo que se les debe por pedidos entregados y cobrados. Transferí desde tu banco, anotá el número de operación y registralo: el
          vendedor lo ve en «Mis cobros».
        </p>
      </div>

      <CommissionForm key={commission} current={commission} onSaved={() => { reloadCommission(); reload(); }} />

      {payouts.length === 0 ? (
        <EmptyState illustration="basket" title="No hay nada para liquidar" description="Cuando se entreguen pedidos pagos, aparecen acá." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {payouts.map((p) => (
            <PayoutCard key={p.emprendimiento_id} payout={p} onSettled={reload} />
          ))}
        </div>
      )}
    </div>
  );
}
