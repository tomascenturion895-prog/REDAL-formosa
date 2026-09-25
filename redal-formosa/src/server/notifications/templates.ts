import type { NotificationMessage } from "./channel";

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Todo texto que llega de una persona se escapa antes de entrar a un email HTML. */
export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });

export interface OrderPaidData {
  buyerName: string;
  orderNumber: string;
  total: number;
  address: string;
}

export function orderPaidEmail(data: OrderPaidData): NotificationMessage {
  const name = escapeHtml(data.buyerName || "");
  const number = escapeHtml(data.orderNumber);
  const address = escapeHtml(data.address);
  const total = escapeHtml(money.format(data.total));

  return {
    subject: `Recibimos tu pago: pedido ${data.orderNumber}`,
    text: `Hola${data.buyerName ? ` ${data.buyerName}` : ""}, recibimos el pago de tu pedido ${data.orderNumber} por ${money.format(data.total)}. Lo entregamos en ${data.address}.`,
    html: `<!doctype html>
<html lang="es"><body style="margin:0;background:#f7f8f7;font-family:Arial,Helvetica,sans-serif;color:#1c201f">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#1b5c50;color:#ffffff;padding:20px 24px;font-size:20px;font-weight:bold">RedAL Formosa</td></tr>
      <tr><td style="padding:24px">
        <h1 style="margin:0 0 12px;font-size:22px">Recibimos tu pago${name ? `, ${name}` : ""}</h1>
        <p style="margin:0 0 16px;color:#565d59">El emprendimiento ya puede preparar tu pedido.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8f7;border-radius:8px">
          <tr><td style="padding:12px 16px;color:#565d59">Pedido</td><td style="padding:12px 16px;text-align:right;font-weight:bold">${number}</td></tr>
          <tr><td style="padding:12px 16px;color:#565d59">Total</td><td style="padding:12px 16px;text-align:right;font-weight:bold">${total}</td></tr>
          <tr><td style="padding:12px 16px;color:#565d59">Entrega en</td><td style="padding:12px 16px;text-align:right">${address}</td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  };
}

export function orderPaidSms(data: OrderPaidData): NotificationMessage {
  return { text: `RedAL Formosa: recibimos el pago de tu pedido ${data.orderNumber} (${money.format(data.total)}).` };
}
