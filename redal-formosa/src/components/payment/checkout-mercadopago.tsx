"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

import { formatPrice } from "@/lib/format";
import { CheckIcon, ExternalLinkIcon, RefreshIcon } from "@/components/ui/icons";
import { Alert } from "@/components/ui/alert";

interface CheckoutMercadoPagoProps {
  ordenId: string;
  monto: number;
  tituloItem?: string;
  clienteNombre?: string;
  clienteEmail?: string;
  onPagoAprobado?: (data: { payment_id?: string; monto?: number }) => void;
}

export function CheckoutMercadoPago({
  ordenId,
  monto,
  tituloItem,
  clienteNombre,
  clienteEmail,
  onPagoAprobado,
}: CheckoutMercadoPagoProps) {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [pagoAprobado, setPagoAprobado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<any>(null);

  // 1. Obtener la URL de pago de Mercado Pago
  useEffect(() => {
    let mounted = true;

    async function obtenerLink() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/pagos/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orden_id: ordenId,
            monto,
            titulo_item: tituloItem,
            cliente_nombre: clienteNombre,
            cliente_email: clienteEmail,
          }),
        });

        const data = await res.json();

        if (!mounted) return;

        if (!res.ok) {
          throw new Error(data.error || "No se pudo generar el pago con Mercado Pago");
        }

        if (data.checkout_url) {
          setCheckoutUrl(data.checkout_url);
        } else {
          throw new Error("No se recibió la URL de checkout");
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Error al conectar con Mercado Pago");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (ordenId && monto > 0) {
      obtenerLink();
    }

    return () => {
      mounted = false;
    };
  }, [ordenId, monto, tituloItem, clienteNombre, clienteEmail]);

  // 2. Polling cada 3 segundos: Detecta si pagó escaneando el QR con el celular
  useEffect(() => {
    if (pagoAprobado || !ordenId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pagos/verificar-pago/${encodeURIComponent(ordenId)}`);
        const data = await res.json();
        if (data.confirmado) {
          setPagoAprobado(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
          onPagoAprobado?.(data);
        }
      } catch {
        // Silencioso para no saturar la consola en cada ciclo
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pagoAprobado, ordenId, onPagoAprobado]);

  if (pagoAprobado) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-6 text-center shadow-md dark:bg-emerald-950/20">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
          <CheckIcon size={28} />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          🎉 ¡Tu pago fue acreditado con éxito!
        </h3>
        <p className="mt-2 text-sm text-muted">
          El pedido ha sido marcado como pagado. Podés continuar a los detalles del pedido o esperar la confirmación.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Pagar con Mercado Pago</h3>
          <p className="text-xs text-muted">Escaneá el QR o pagá directamente en tu navegador</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted block">Monto total</span>
          <span className="text-xl font-extrabold text-foreground">{formatPrice(monto)}</span>
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading && !checkoutUrl && (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <RefreshIcon size={28} className="animate-spin text-action" />
          <span className="text-sm font-medium text-muted">Generando código de pago...</span>
        </div>
      )}

      {checkoutUrl && (
        <div className="flex flex-col items-center space-y-6">
          {/* Opción 1: QR para pagar desde el celular */}
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl border-4 border-white bg-white p-3 shadow-md">
              <QRCodeSVG
                value={checkoutUrl}
                size={210}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="mt-3 text-xs text-muted max-w-[260px]">
              Escaneá con la cámara de tu celular o desde la aplicación de Mercado Pago
            </p>
          </div>

          {/* Indicador de verificación en vivo */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted bg-surface-muted px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Verificando acreditación en vivo...</span>
          </div>

          <div className="w-full border-t border-border pt-4">
            {/* Opción 2: Botón directo para pagar en la misma PC */}
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-base shadow-sm"
            >
              <span>Abrir Mercado Pago en esta PC</span>
              <ExternalLinkIcon size={18} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
