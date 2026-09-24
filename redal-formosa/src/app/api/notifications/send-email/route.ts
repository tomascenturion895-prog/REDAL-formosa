import { notificationsService } from "@/lib/notifications/notifications-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, userId } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    // Enviar email
    const sent = await notificationsService.sendEmail({
      to,
      subject,
      html,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Registrar en BD si userId proporcionado
    if (userId) {
      await notificationsService.logNotification({
        usuario_id: userId,
        tipo: "email",
        asunto: subject,
        cuerpo: html,
        destinatario: to,
        estado: "enviado",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error in send-email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
