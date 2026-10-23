import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findFirst({
    where: user.role === "SUPER_ADMIN" ? {} : { id: user.companyId || "" },
    include: { notificationSettings: true },
  });

  return NextResponse.json({ company });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Only HR or Admins can edit settings." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      companyName,
      email,
      hrContactEmail,
      saudiTimezone,
      commercialRegNo,
      reminderDays,
      recipients,
      enabled,
      postExpiryFrequencyDays,
    } = body;

    const company = await prisma.company.findFirst({
      where: user.role === "SUPER_ADMIN" ? {} : { id: user.companyId || "" },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        companyName: companyName?.trim() || company.companyName,
        email: email?.trim() || company.email,
        hrContactEmail: hrContactEmail?.trim() || company.hrContactEmail,
        saudiTimezone: saudiTimezone || company.saudiTimezone,
        commercialRegNo: commercialRegNo || company.commercialRegNo,
      },
    });

    // Update Notification Settings
    if (reminderDays || recipients !== undefined || enabled !== undefined) {
      await prisma.notificationSetting.upsert({
        where: { companyId: company.id },
        create: {
          companyId: company.id,
          reminderDays: JSON.stringify(reminderDays || [30, 15, 7, 3, 1, 0]),
          recipients: JSON.stringify(recipients || ["EMPLOYEE", "HR_MANAGER", "SUPER_ADMIN"]),
          enabled: enabled !== undefined ? enabled : true,
          postExpiryFrequencyDays: postExpiryFrequencyDays || 7,
        },
        update: {
          reminderDays: reminderDays ? JSON.stringify(reminderDays) : undefined,
          recipients: recipients ? JSON.stringify(recipients) : undefined,
          enabled: enabled !== undefined ? enabled : undefined,
          postExpiryFrequencyDays: postExpiryFrequencyDays || undefined,
        },
      });
    }

    await logAuditEvent({
      companyId: company.id,
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entityType: "SETTINGS",
      details: "Updated company settings and notification schedules",
    });

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: "Company and notification settings updated successfully.",
    });
  } catch (error: any) {
    console.error("Company settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to update company settings." }, { status: 500 });
  }
}
