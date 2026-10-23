import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendIqamaNotification } from "@/lib/emailService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const log = await prisma.notificationLog.findUnique({
    where: { id },
    include: { employee: true },
  });

  if (!log) {
    return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
  }

  // Update status to pending and re-send
  await prisma.notificationLog.update({
    where: { id },
    data: { status: "PENDING", errorMessage: null },
  });

  const result = await sendIqamaNotification({
    employeeId: log.employeeId,
    recipientEmail: log.recipient,
    notificationType: log.notificationType,
    scheduledDate: new Date(),
  });

  return NextResponse.json({
    success: result.success,
    message: result.message,
  });
}
