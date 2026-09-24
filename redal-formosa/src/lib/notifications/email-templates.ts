/**
 * Templates de emails para diferentes eventos
 */

export const emailTemplates = {
  /**
   * Confirmación de registro
   */
  welcomeEmail: (nombre: string, verificationLink: string) => ({
    subject: "Bienvenido a RedAL Formosa",
    html: `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a RedAL Formosa!</h1>
            </div>
            <div class="content">
              <p>Hola ${nombre},</p>
              <p>Gracias por registrarte en RedAL Formosa. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
              <p>Para completar tu registro, verifica tu email:</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verificar Email</a>
              </p>
              <p>Si no solicitaste crear una cuenta, simplemente ignora este email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 RedAL Formosa. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Confirmación de pedido
   */
  orderConfirmationEmail: (
    nombre: string,
    numeroPedido: string,
    monto: number,
    direccion: string
  ) => ({
    subject: `Pedido confirmado #${numeroPedido}`,
    html: `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; border-radius: 5px; }
            .order-info { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Pedido Confirmado!</h1>
            </div>
            <div class="order-info">
              <p><strong>Hola ${nombre},</strong></p>
              <p>Tu pedido ha sido confirmado exitosamente.</p>
              <hr>
              <p><strong>Número de Pedido:</strong> ${numeroPedido}</p>
              <p><strong>Monto Total:</strong> $${monto.toFixed(2)}</p>
              <p><strong>Dirección de Entrega:</strong> ${direccion}</p>
              <hr>
              <p>Recibirás actualizaciones sobre el estado de tu entrega.</p>
              <p>Puedes seguir tu pedido en: <a href="https://redal.local/tracking">Ver tracking</a></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 RedAL Formosa.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Actualización de estado de pedido
   */
  orderStatusEmail: (nombre: string, numeroPedido: string, nuevoEstado: string) => ({
    subject: `Actualización de tu pedido #${numeroPedido}`,
    html: `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; border-radius: 5px; }
            .status { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Actualización de tu pedido</h1>
            </div>
            <div class="status">
              <p>Hola ${nombre},</p>
              <p>Tu pedido <strong>#${numeroPedido}</strong> ha sido actualizado:</p>
              <p style="font-size: 18px; color: #FF9800;"><strong>Estado: ${nuevoEstado}</strong></p>
              <p>Puedes ver más detalles en: <a href="https://redal.local/tracking">Ver tracking</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Recordatorio de carrito abandonado
   */
  cartAbandonedEmail: (nombre: string, monto: number, cartLink: string) => ({
    subject: "No olvides completar tu compra",
    html: `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #9C27B0; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; }
            .button { background: #9C27B0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡No olvides tu carrito!</h1>
            </div>
            <div class="content">
              <p>Hola ${nombre},</p>
              <p>Vimos que dejaste items en tu carrito por $${monto.toFixed(2)}.</p>
              <p>¿Quieres completar tu compra?</p>
              <p style="text-align: center;">
                <a href="${cartLink}" class="button">Ver mi carrito</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Oferta especial
   */
  specialOfferEmail: (nombre: string, oferta: string, descuento: number, link: string) => ({
    subject: `¡${descuento}% de descuento! ${oferta}`,
    html: `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #E91E63; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .discount { font-size: 48px; font-weight: bold; }
            .button { background: #E91E63; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="discount">${descuento}% OFF</div>
              <h1>Oferta especial para ti</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hola ${nombre},</p>
              <p>Tenemos una oferta especial exclusiva: ${oferta}</p>
              <p style="text-align: center;">
                <a href="${link}" class="button">Ver oferta</a>
              </p>
              <p style="color: #999; font-size: 12px;">Esta oferta es válida por tiempo limitado.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

export type EmailTemplate = keyof typeof emailTemplates;
