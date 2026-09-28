/** Pide al servidor la pantalla de pago de Mercado Pago para un pedido propio pendiente y devuelve su URL. */
export async function requestPaymentUrl(orderId: string): Promise<string> {
  const response = await fetch("/api/checkout/create-preference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pedidoId: orderId }),
  });
  if (!response.ok) throw new Error("No pudimos abrir Mercado Pago");
  const { url } = (await response.json()) as { url?: string };
  if (!url) throw new Error("No pudimos abrir Mercado Pago");
  return url;
}
