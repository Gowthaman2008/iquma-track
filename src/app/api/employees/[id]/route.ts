import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decryptIqamaNumber, encryptIqamaNumber, maskIqamaNumber } from "@/lib/crypto";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";
import { logAuditEvent } from "@/lib/audit";
import { getFallbackEmployeeById, updateFallbackEmployee, deleteFallbackEmployee } from "@/lib/demoStore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
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

    if (employee) {
      const evaluation = evaluateIqamaExpiry(employee.iqamaExpiryDate, employee.iqamaIssueDate);
      let plainIqamaNumber = employee.iqamaNumberMasked;
      if (user.role === "SUPER_ADMIN" || user.role === "HR_MANAGER") {
        try {
          plainIqamaNumber = decryptIqamaNumber(employee.iqamaNumberEncrypted);
        } catch {
          plainIqamaNumber = employee.iqamaNumberMasked;
        }
      }

      const notes = employee.notes || "";
      const bankMatch = notes.match(/Bank:\s*([^\s(|]+)/);
      const acMatch = notes.match(/A\/C:\s*([^)|]+)/);
      const nameArbMatch = notes.match(/Name \(Arabic\):\s*([^|]+)/);
      const salaryMatch = notes.match(/Base Salary:\s*([^|]+)/);

      const bank = bankMatch ? bankMatch[1].trim() : ((employee as any).bank || "—");
      const bankAc = acMatch ? acMatch[1].trim() : ((employee as any).bankAccount || "—");
      const nameArb = nameArbMatch ? nameArbMatch[1].trim() : "";
      const salary = salaryMatch ? salaryMatch[1].trim() : "";
      const todayFormatted = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date());

      return NextResponse.json({
        employee: {
          ...employee,
          plainIqamaNumber,
          rawId: plainIqamaNumber,
          bank,
          bankAc,
          nameArb,
          salary,
          todayStr: todayFormatted,
          evaluation,
        },
      });
    }
  } catch (err) {
    console.warn("DB find employee failed, using fallback:", err);
  }

  // Fallback to demo store
  const fallback = getFallbackEmployeeById(id);
  if (!fallback) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  return NextResponse.json({
    employee: {
      ...fallback,
      plainIqamaNumber: fallback.iqamaNumberMasked,
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

  let updated: any = null;

  try {
    const existing = await prisma.employee.findUnique({
      where: { id },
    });

    if (existing) {
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

      updated = await prisma.employee.update({
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
      }).catch(() => {});
    }
  } catch (e) {
    console.warn("DB update failed, updating in fallback store:", e);
  }

  // Always update in fallback store
  const fallbackUpdated = updateFallbackEmployee(id, body);

  return NextResponse.json({
    success: true,
    employee: updated || fallbackUpdated,
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

  try {
    await prisma.employee.delete({
      where: { id },
    });
  } catch (e) {
    console.warn("DB delete failed, deleting from fallback store:", e);
  }

  deleteFallbackEmployee(id);

  return NextResponse.json({
    success: true,
    message: `Employee record deleted successfully.`,
  });
}
