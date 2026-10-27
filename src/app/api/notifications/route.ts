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
  const statusFilter = searchParams.get("status") || "ALL";

  const whereEmployee: any = {};
  if (user.role !== "SUPER_ADMIN" && user.companyId) {
    whereEmployee.companyId = user.companyId;
  }

  // Active employees needing expiry alerts
  const employees = await prisma.employee.findMany({
    where: { ...whereEmployee, status: "ACTIVE" },
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      iqamaNumberMasked: true,
      department: true,
      iqamaExpiryDate: true,
      email: true,
    },
    orderBy: { iqamaExpiryDate: "asc" },
  });

  const alerts = (employees as any[])
    .map((emp: any) => {
      const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate);
      return {
        id: `alert-${emp.id}`,
        employeeId: emp.id,
        employeeCode: emp.employeeId,
        fullName: emp.fullName,
        department: emp.department,
        maskedIqama: emp.iqamaNumberMasked,
        expiryDate: evaluation.formattedDate,
        daysRemaining: evaluation.daysRemaining,
        status: evaluation.status,
        statusLabel: evaluation.statusLabel,
        isActionRequired: evaluation.isActionRequired,
      };
    })
    .filter((a: any) => a.isActionRequired)
    .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);

  // Email notifications summary
  const logsWhere: any = {};
  if (statusFilter !== "ALL") {
    logsWhere.status = statusFilter;
  }

  const logs = await prisma.notificationLog.findMany({
    where: logsWhere,
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          fullName: true,
          employeeId: true,
          company: { select: { companyName: true } },
        },
      },
    },
  });

  const sentCount = await prisma.notificationLog.count({ where: { status: "SENT" } });
  const failedCount = await prisma.notificationLog.count({ where: { status: "FAILED" } });
  const pendingCount = await prisma.notificationLog.count({ where: { status: "PENDING" } });

  return NextResponse.json({
    alerts,
    recentLogs: logs,
    stats: {
      criticalAlerts: alerts.filter((a: any) => a.status === "CRITICAL" || a.status === "EXPIRES_TODAY").length,
      expiringSoonAlerts: alerts.filter((a: any) => a.status === "EXPIRING_SOON").length,
      expiredAlerts: alerts.filter((a: any) => a.status === "EXPIRED").length,
      sentCount,
      failedCount,
      pendingCount,
    },
  });
}
