import { notificationsService } from "@/lib/notifications/notifications-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, body: smsBody, userId } = body;

    if (!to || !smsBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    // Validar formato de teléfono
    if (!to.match(/^\+?[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Enviar SMS
    const sent = await notificationsService.sendSMS({
      to,
      body: smsBody,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: 500 }
      );
    }

    // Registrar en BD si userId proporcionado
    if (userId) {
      await notificationsService.logNotification({
        usuario_id: userId,
        tipo: "sms",
        cuerpo: smsBody,
        destinatario: to,
        estado: "enviado",
      });
    }

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
    });
  } catch (error) {
    console.error("Error in send-sms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
