import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";
import { logAuditEvent } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Only HR or Admins can record renewals." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { newExpiryDate, renewalDate, cost, notes } = body;

  if (!newExpiryDate) {
    return NextResponse.json({ error: "New expiry date is required." }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  const previousExpiry = employee.iqamaExpiryDate;
  const updatedNewExpiry = new Date(newExpiryDate);
  const actualRenewalDate = renewalDate ? new Date(renewalDate) : new Date();

  // 1. Create Renewal History record
  const renewalRecord = await prisma.iqamaRenewalHistory.create({
    data: {
      employeeId: employee.id,
      previousExpiryDate: previousExpiry,
      newExpiryDate: updatedNewExpiry,
      renewalDate: actualRenewalDate,
      updatedById: user.id,
      updatedByName: user.name,
      cost: cost ? parseFloat(cost) : null,
      notes: notes || "Iqama renewed successfully.",
    },
  });

  // 2. Update employee current expiry date and status
  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: {
      iqamaExpiryDate: updatedNewExpiry,
      status: "ACTIVE",
    },
  });

  // 3. Log audit event
  await logAuditEvent({
    companyId: employee.companyId,
    userId: user.id,
    userName: user.name,
    action: "RENEW",
    entityType: "RENEWAL",
    entityId: renewalRecord.id,
    details: `Renewed Iqama for ${employee.fullName} (${employee.employeeId}). Previous: ${previousExpiry.toISOString().split("T")[0]} -> New: ${updatedNewExpiry.toISOString().split("T")[0]}`,
  });

  const evaluation = evaluateIqamaExpiry(updatedNewExpiry);

  return NextResponse.json({
    success: true,
    message: "Iqama renewed successfully. Expiry tracking schedule reset.",
    renewal: renewalRecord,
    employee: {
      ...updatedEmployee,
      evaluation,
    },
  });
}
