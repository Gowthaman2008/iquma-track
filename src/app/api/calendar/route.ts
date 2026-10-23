import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || `${new Date().getFullYear()}`, 10);
  const month = parseInt(searchParams.get("month") || `${new Date().getMonth() + 1}`, 10);

  const where: any = { status: "ACTIVE" };
  if (user.role !== "SUPER_ADMIN" && user.companyId) {
    where.companyId = user.companyId;
  }

  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      iqamaNumberMasked: true,
      department: true,
      iqamaExpiryDate: true,
      nationality: true,
    },
    orderBy: { iqamaExpiryDate: "asc" },
  });

  const events = employees.map((emp) => {
    const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate);
    return {
      id: emp.id,
      title: `${emp.fullName} (${emp.employeeId})`,
      dateStr: emp.iqamaExpiryDate.toISOString().split("T")[0],
      department: emp.department,
      maskedIqama: emp.iqamaNumberMasked,
      daysRemaining: evaluation.daysRemaining,
      status: evaluation.status,
      statusLabel: evaluation.statusLabel,
      badgeColor: evaluation.badgeBg,
    };
  });

  return NextResponse.json({
    year,
    month,
    events,
  });
}
