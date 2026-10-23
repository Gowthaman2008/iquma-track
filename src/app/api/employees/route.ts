import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptIqamaNumber, maskIqamaNumber } from "@/lib/crypto";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "";
  const nationality = searchParams.get("nationality") || "";
  const statusFilter = searchParams.get("status") || "";
  const expiryFilter = searchParams.get("expiryStatus") || "";
  const companyFilter = searchParams.get("companyId") || "";

  const where: any = {};

  // Company tenancy restriction
  if (user.role !== "SUPER_ADMIN" && user.companyId) {
    where.companyId = user.companyId;
  } else if (companyFilter) {
    where.companyId = companyFilter;
  }

  // Search filter
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { employeeId: { contains: search } },
      { iqamaNumberMasked: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (department && department !== "ALL") {
    where.department = department;
  }

  if (nationality && nationality !== "ALL") {
    where.nationality = nationality;
  }

  if (statusFilter && statusFilter !== "ALL") {
    where.status = statusFilter;
  }

  const employees = await prisma.employee.findMany({
    where,
    include: {
      company: {
        select: { id: true, companyName: true },
      },
      documents: {
        select: { id: true, fileName: true, mimeType: true, uploadedAt: true },
      },
    },
    orderBy: { iqamaExpiryDate: "asc" },
  });

  // Evaluate expiry for each employee
  let enriched = employees.map((emp) => {
    const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate, emp.iqamaIssueDate);
    return {
      ...emp,
      evaluation,
    };
  });

  // Filter by expiry status if requested
  if (expiryFilter && expiryFilter !== "ALL") {
    enriched = enriched.filter((e) => e.evaluation.status === expiryFilter);
  }

  return NextResponse.json({
    employees: enriched,
    total: enriched.length,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Employees cannot add records." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      fullName,
      employeeId,
      iqamaNumber,
      iqamaIssueDate,
      iqamaExpiryDate,
      email,
      mobileNumber,
      nationality,
      department,
      jobPosition,
      companyId,
      status,
      dob,
      gender,
      passportNumber,
      passportExpiryDate,
      notes,
    } = body;

    if (!fullName || !employeeId || !iqamaNumber || !iqamaExpiryDate || !email || !department) {
      return NextResponse.json(
        { error: "Required fields missing. Please provide name, employee ID, Iqama number, expiry date, email, and department." },
        { status: 400 }
      );
    }

    // Check unique employeeId
    const existing = await prisma.employee.findUnique({
      where: { employeeId: employeeId.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Employee ID "${employeeId}" already exists.` },
        { status: 409 }
      );
    }

    const targetCompanyId = (user.role === "SUPER_ADMIN" && companyId) ? companyId : (user.companyId || (await prisma.company.findFirst())?.id);

    if (!targetCompanyId) {
      return NextResponse.json({ error: "No associated company found." }, { status: 400 });
    }

    const encryptedIqama = encryptIqamaNumber(iqamaNumber.trim());
    const maskedIqama = maskIqamaNumber(iqamaNumber.trim());

    const newEmployee = await prisma.employee.create({
      data: {
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        iqamaNumberEncrypted: encryptedIqama,
        iqamaNumberMasked: maskedIqama,
        iqamaIssueDate: iqamaIssueDate ? new Date(iqamaIssueDate) : new Date(),
        iqamaExpiryDate: new Date(iqamaExpiryDate),
        email: email.trim().toLowerCase(),
        mobileNumber: mobileNumber || "",
        nationality: nationality || "Other",
        department: department.trim(),
        jobPosition: jobPosition || "Staff",
        companyId: targetCompanyId,
        status: status || "ACTIVE",
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        passportNumber: passportNumber || null,
        passportExpiryDate: passportExpiryDate ? new Date(passportExpiryDate) : null,
        notes: notes || null,
      },
    });

    await logAuditEvent({
      companyId: targetCompanyId,
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entityType: "EMPLOYEE",
      entityId: newEmployee.id,
      details: `Created employee ${newEmployee.fullName} (${newEmployee.employeeId})`,
    });

    return NextResponse.json({
      success: true,
      employee: newEmployee,
      message: "Employee created successfully.",
    });
  } catch (error: any) {
    console.error("Create employee error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create employee record." },
      { status: 500 }
    );
  }
}
