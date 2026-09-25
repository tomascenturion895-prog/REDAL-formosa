import { describe, expect, it } from "vitest";

import { escapeHtml, orderPaidEmail, orderPaidSms } from "./templates";

const data = { buyerName: "Ana", orderNumber: "PED-260924-ABC123", total: 3150, address: "Av. 25 de Mayo 123" };

describe("escapeHtml", () => {
  it("escapa los caracteres que permiten inyectar HTML", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;",
    );
  });
});

describe("orderPaidEmail", () => {
  it("incluye los datos del pedido", () => {
    const { subject, html, text } = orderPaidEmail(data);
    expect(subject).toContain("PED-260924-ABC123");
    expect(html).toContain("Av. 25 de Mayo 123");
    expect(text).toContain("PED-260924-ABC123");
  });

  it("neutraliza HTML enviado por el usuario en nombre y dirección", () => {
    const { html } = orderPaidEmail({ ...data, buyerName: "<img src=x onerror=alert(1)>", address: "<a href='//evil'>clic</a>" });
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<a href='//evil'>");
    expect(html).toContain("&lt;img");
  });
});

describe("orderPaidSms", () => {
  it("es un texto corto sin HTML", () => {
    const sms = orderPaidSms(data);
    expect(sms.html).toBeUndefined();
    expect(sms.text.length).toBeLessThan(160);
    expect(sms.text).toContain("PED-260924-ABC123");
  });
});
