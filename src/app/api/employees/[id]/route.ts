import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decryptIqamaNumber, encryptIqamaNumber, maskIqamaNumber } from "@/lib/crypto";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";
import { logAuditEvent } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      company: true,
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
      renewalHistory: {
        orderBy: { renewalDate: "desc" },
      },
      notificationLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  // Multi-tenant authorization
  if (user.role !== "SUPER_ADMIN" && employee.companyId !== user.companyId) {
    return NextResponse.json({ error: "Forbidden access." }, { status: 403 });
  }

  const evaluation = evaluateIqamaExpiry(employee.iqamaExpiryDate, employee.iqamaIssueDate);

  // Decrypt Iqama number only for HR Manager or Super Admin
  let plainIqamaNumber = employee.iqamaNumberMasked;
  if (user.role === "SUPER_ADMIN" || user.role === "HR_MANAGER") {
    plainIqamaNumber = decryptIqamaNumber(employee.iqamaNumberEncrypted);
  }

  return NextResponse.json({
    employee: {
      ...employee,
      plainIqamaNumber,
      evaluation,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.employee.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  const updateData: any = {
    fullName: body.fullName?.trim() || existing.fullName,
    email: body.email?.trim().toLowerCase() || existing.email,
    mobileNumber: body.mobileNumber || existing.mobileNumber,
    nationality: body.nationality || existing.nationality,
    department: body.department?.trim() || existing.department,
    jobPosition: body.jobPosition || existing.jobPosition,
    status: body.status || existing.status,
    gender: body.gender || existing.gender,
    notes: body.notes !== undefined ? body.notes : existing.notes,
    passportNumber: body.passportNumber || existing.passportNumber,
  };

  if (body.iqamaNumber && body.iqamaNumber.trim().length >= 5) {
    updateData.iqamaNumberEncrypted = encryptIqamaNumber(body.iqamaNumber.trim());
    updateData.iqamaNumberMasked = maskIqamaNumber(body.iqamaNumber.trim());
  }

  if (body.iqamaExpiryDate) {
    updateData.iqamaExpiryDate = new Date(body.iqamaExpiryDate);
  }

  if (body.iqamaIssueDate) {
    updateData.iqamaIssueDate = new Date(body.iqamaIssueDate);
  }

  if (body.dob) {
    updateData.dob = new Date(body.dob);
  }

  if (body.passportExpiryDate) {
    updateData.passportExpiryDate = new Date(body.passportExpiryDate);
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    companyId: updated.companyId,
    userId: user.id,
    userName: user.name,
    action: "UPDATE",
    entityType: "EMPLOYEE",
    entityId: updated.id,
    details: `Updated details for employee ${updated.fullName} (${updated.employeeId})`,
  });

  return NextResponse.json({
    success: true,
    employee: updated,
    message: "Employee details updated successfully.",
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges." }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.employee.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  await prisma.employee.delete({
    where: { id },
  });

  await logAuditEvent({
    companyId: existing.companyId,
    userId: user.id,
    userName: user.name,
    action: "DELETE",
    entityType: "EMPLOYEE",
    entityId: id,
    details: `Deleted employee record: ${existing.fullName} (${existing.employeeId})`,
  });

  return NextResponse.json({
    success: true,
    message: `Employee ${existing.fullName} deleted successfully.`,
  });
}
