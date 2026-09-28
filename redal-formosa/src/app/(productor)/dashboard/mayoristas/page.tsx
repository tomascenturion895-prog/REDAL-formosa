"use client";

import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { b2bRepository } from "@/lib/b2b/b2b-repository";
import { businessLabel, daysLeft, frequencyLabel, offerMessage } from "@/lib/domain/b2b";
import { useAsync } from "@/lib/hooks/use-async";
import { producerRepository } from "@/lib/producer/producer-repository";
import { WhatsAppButton } from "@/components/contact/whatsapp-button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

/** Comercios que piden cotización por volumen: el vendedor los contacta por WhatsApp. */
export default function MayoristasPage() {
  const { user, pending } = useRequireAuth();
  const { data: requests, error, loading } = useAsync(() => b2bRepository.board(), [user?.id], { enabled: Boolean(user), scope: user?.id });
  const { data: stores } = useAsync(() => producerRepository.ownEmprendimientos(user!.id), [user?.id], { enabled: Boolean(user), scope: user?.id });
  const sellerName = stores?.[0]?.nombre ?? "un productor de la red";

  if (pending || loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (error) return <Alert tone="error">No pudimos cargar las solicitudes. Probá de nuevo en un momento.</Alert>;

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        icon={<StoreIcon size={36} />}
        title="No hay solicitudes mayoristas abiertas"
        description="Cuando un restaurante, verdulería o comedor pida cotización, aparece acá para que le escribas."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted">Comercios que buscan comprar por volumen. Escribiles con tu oferta: la primera respuesta suele ganar el pedido.</p>
      <ul className="grid gap-4 lg:grid-cols-2">
        {requests.map((r) => (
          <li key={r.id} className="card flex flex-col gap-4 p-5">
            <div>
              <h3 className="font-display text-lg font-semibold leading-tight">{r.razon_social}</h3>
              <p className="text-sm text-muted">
                {businessLabel(r.tipo_comercio)} · {r.localidad} · vence en {daysLeft(r.expires_at)} días
              </p>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Busca</dt>
                <dd className="font-medium">{r.productos}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Volumen</dt>
                <dd>{r.volumen}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Frecuencia</dt>
                <dd>{frequencyLabel(r.frecuencia)}</dd>
              </div>
              {r.mensaje && (
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-muted">Notas</dt>
                  <dd>{r.mensaje}</dd>
                </div>
              )}
            </dl>
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-sm text-muted">Contacto: {r.contacto_nombre}</p>
              <WhatsAppButton telefono={r.telefono} mensaje={offerMessage(r, sellerName)} label="Enviar oferta" size="sm" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
