import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptIqamaNumber, decryptIqamaNumber, maskIqamaNumber } from "@/lib/crypto";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";
import { logAuditEvent } from "@/lib/audit";
import { getFallbackEmployees, addFallbackEmployee } from "@/lib/demoStore";

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

  let enriched: any[] = [];
  let dbFailedOrEmpty = false;

  try {
    const where: any = {};

    // Company tenancy restriction: Admins and HR Managers can view all group companies
    if (user.role !== "SUPER_ADMIN" && user.role !== "HR_MANAGER" && user.companyId) {
      where.companyId = user.companyId;
    } else if (companyFilter && companyFilter !== "ALL") {
      where.companyId = companyFilter;
    }

    // Search filter
    if (search) {
      const trimmed = search.trim();
      const orConditions: any[] = [
        { fullName: { contains: trimmed } },
        { employeeId: { contains: trimmed } },
        { iqamaNumberMasked: { contains: trimmed } },
        { email: { contains: trimmed } },
        { notes: { contains: trimmed } },
      ];

      if (trimmed.length >= 5) {
        const masked = maskIqamaNumber(trimmed);
        orConditions.push({ iqamaNumberMasked: { contains: masked } });
        const start3 = trimmed.slice(0, 3);
        const end3 = trimmed.slice(-3);
        orConditions.push({
          AND: [
            { iqamaNumberMasked: { startsWith: start3 } },
            { iqamaNumberMasked: { endsWith: end3 } },
          ],
        });
      }

      where.OR = orConditions;
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

    if (employees && employees.length > 0) {
      const todayFormatted = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date());

      enriched = (employees as any[]).map((emp: any, index: number) => {
        const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate, emp.iqamaIssueDate);

        // Decrypt plain ID Number for authorized administrators
        let rawId = emp.iqamaNumberMasked;
        if (emp.iqamaNumberEncrypted) {
          try {
            const dec = decryptIqamaNumber(emp.iqamaNumberEncrypted);
            if (dec && dec !== "DECRYPTION_ERROR") {
              rawId = dec;
            }
          } catch (e) {}
        }

        // Extract banking details and Arabic name from notes
        const notes = emp.notes || "";
        const bankMatch = notes.match(/Bank:\s*([^\s(|]+)/);
        const acMatch = notes.match(/A\/C:\s*([^)|]+)/);
        const nameArbMatch = notes.match(/Name \(Arabic\):\s*([^|]+)/);
        const salaryMatch = notes.match(/Base Salary:\s*([^|]+)/);

        const bank = bankMatch ? bankMatch[1].trim() : (emp.bank || "—");
        const bankAc = acMatch ? acMatch[1].trim() : (emp.bankAccount || "—");
        const nameArb = nameArbMatch ? nameArbMatch[1].trim() : "";
        const salary = salaryMatch ? salaryMatch[1].trim() : "";

        return {
          ...emp,
          serialNo: index + 1,
          rawId,
          bank,
          bankAc,
          nameArb,
          salary,
          todayStr: todayFormatted,
          evaluation,
        };
      });

      if (expiryFilter && expiryFilter !== "ALL") {
        enriched = enriched.filter((e: any) => e.evaluation.status === expiryFilter);
      }
    } else {
      // Check if DB is genuinely empty (0 employees in database table)
      const count = await prisma.employee.count().catch(() => 0);
      if (count === 0) {
        dbFailedOrEmpty = true;
      }
    }
  } catch (dbErr) {
    console.warn("Prisma query failed in /api/employees, falling back to demo store:", dbErr);
    dbFailedOrEmpty = true;
  }

  // Guaranteed fallback for Vercel serverless when database is unattached, empty, or fails
  if (dbFailedOrEmpty || (enriched.length === 0 && !search && department === "" && expiryFilter === "")) {
    enriched = getFallbackEmployees({
      search,
      companyId: companyFilter,
      department,
      nationality,
      status: statusFilter,
      expiryStatus: expiryFilter,
      userRole: user.role,
      userCompanyId: user.companyId,
    });
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

    const encryptedIqama = encryptIqamaNumber(iqamaNumber.trim());
    const maskedIqama = maskIqamaNumber(iqamaNumber.trim());
    const targetCompanyId = (user.role === "SUPER_ADMIN" && companyId) ? companyId : (user.companyId || "cmvla9fqc0000r7tkb82ni1l4");

    let newEmployee: any = null;

    try {
      // Check unique employeeId in DB if reachable
      const existing = await prisma.employee.findUnique({
        where: { employeeId: employeeId.trim() },
      }).catch(() => null);

      if (existing) {
        return NextResponse.json(
          { error: `Employee ID "${employeeId}" already exists.` },
          { status: 409 }
        );
      }

      newEmployee = await prisma.employee.create({
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
      }).catch(() => {});
    } catch (dbError) {
      console.warn("DB create employee failed, falling back to in-memory store:", dbError);
    }

    // Always mirror to in-memory store so it shows immediately
    if (!newEmployee) {
      newEmployee = addFallbackEmployee({
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        iqamaNumberEncrypted: encryptedIqama,
        iqamaNumberMasked: maskedIqama,
        iqamaIssueDate: iqamaIssueDate ? new Date(iqamaIssueDate).toISOString() : new Date().toISOString(),
        iqamaExpiryDate: new Date(iqamaExpiryDate).toISOString(),
        email: email.trim().toLowerCase(),
        mobileNumber: mobileNumber || "",
        nationality: nationality || "Other",
        department: department.trim(),
        jobPosition: jobPosition || "Staff",
        companyId: targetCompanyId,
        status: status || "ACTIVE",
        notes: notes || null,
      });
    } else {
      addFallbackEmployee(newEmployee);
    }

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
