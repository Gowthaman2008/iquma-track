import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendIqamaNotification } from "@/lib/emailService";
import { logAuditEvent } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Only HR or Admins can trigger reminders." }, { status: 403 });
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  try {
    const result = await sendIqamaNotification({
      employeeId: employee.id,
      recipientEmail: employee.email,
      notificationType: "MANUAL_REMINDER",
      scheduledDate: new Date(),
    });

    await logAuditEvent({
      companyId: employee.companyId,
      userId: user.id,
      userName: user.name,
      action: "NOTIFY",
      entityType: "EMPLOYEE",
      entityId: employee.id,
      details: `Sent manual Iqama expiry reminder to ${employee.email} (${employee.fullName})`,
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      logId: result.logId,
      duplicate: result.duplicate,
    });
  } catch (error: any) {
    console.error("Manual remind error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch reminder email." },
      { status: 500 }
    );
  }
}
