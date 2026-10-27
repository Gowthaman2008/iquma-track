import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Filter by company if user is not SUPER_ADMIN or if companyId exists
  const whereClause: { companyId?: string } = {};
  if (user.role !== "SUPER_ADMIN" && user.companyId) {
    whereClause.companyId = user.companyId;
  }

  // Fetch employees
  const employees = await prisma.employee.findMany({
    where: whereClause,
    include: {
      company: {
        select: { companyName: true },
      },
    },
    orderBy: { iqamaExpiryDate: "asc" },
  });

  // Calculate statistics using the Riyadh Expiry Engine
  let totalEmployees = employees.length;
  let activeIqamas = 0;
  let expiringSoon = 0;
  let critical = 0;
  let expiresToday = 0;
  let expired = 0;
  let missingInfo = 0;

  const departmentCounts: Record<string, number> = {};
  const monthlyTrends: Record<string, { month: string; valid: number; expiring: number; expired: number }> = {};

  // Initialize next 6 months for trends
  const now = new Date();
  for (let i = -1; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthlyTrends[key] = { month: key, valid: 0, expiring: 0, expired: 0 };
  }

  const evaluatedEmployees = (employees as any[]).map((emp: any) => {
    const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate, emp.iqamaIssueDate);
    
    if (emp.status === "ACTIVE") {
      activeIqamas++;
    }

    if (evaluation.status === "EXPIRED") {
      expired++;
    } else if (evaluation.status === "EXPIRES_TODAY") {
      expiresToday++;
    } else if (evaluation.status === "CRITICAL") {
      critical++;
    } else if (evaluation.status === "EXPIRING_SOON") {
      expiringSoon++;
    }

    // Check missing info (optional fields that may need attention)
    if (!emp.passportNumber || !emp.dob || !emp.gender) {
      missingInfo++;
    }

    // Department grouping
    const dept = emp.department || "Other";
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

    // Monthly trends bucket
    const expDate = new Date(emp.iqamaExpiryDate);
    const monthKey = expDate.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (monthlyTrends[monthKey]) {
      if (evaluation.status === "EXPIRED") {
        monthlyTrends[monthKey].expired++;
      } else if (evaluation.status === "EXPIRING_SOON" || evaluation.status === "CRITICAL" || evaluation.status === "EXPIRES_TODAY") {
        monthlyTrends[monthKey].expiring++;
      } else {
        monthlyTrends[monthKey].valid++;
      }
    }

    return {
      id: emp.id,
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      iqamaNumberMasked: emp.iqamaNumberMasked,
      department: emp.department,
      jobPosition: emp.jobPosition,
      nationality: emp.nationality,
      status: emp.status,
      iqamaExpiryDate: emp.iqamaExpiryDate,
      evaluation,
      companyName: emp.company?.companyName,
    };
  });

  // Recent activity:
  // 1. Recent renewals
  const recentRenewals = await prisma.iqamaRenewalHistory.findMany({
    take: 5,
    orderBy: { renewalDate: "desc" },
    include: {
      employee: {
        select: { fullName: true, employeeId: true },
      },
    },
  });

  // 2. Recent notification logs
  const recentNotifications = await prisma.notificationLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: { fullName: true, employeeId: true },
      },
    },
  });

  // Expiry status distribution
  const statusDistribution = [
    { name: "Valid (>30d)", value: totalEmployees - (expired + expiresToday + critical + expiringSoon), color: "#16A34A" },
    { name: "Expiring Soon (8-30d)", value: expiringSoon, color: "#F59E0B" },
    { name: "Critical (1-7d)", value: critical, color: "#DC2626" },
    { name: "Expires Today", value: expiresToday, color: "#EF4444" },
    { name: "Expired", value: expired, color: "#991B1B" },
  ];

  const departmentData = Object.entries(departmentCounts).map(([department, count]) => ({
    department,
    count,
  }));

  const trendData = Object.values(monthlyTrends);

  return NextResponse.json({
    metrics: {
      totalEmployees,
      activeIqamas,
      expiringSoon,
      critical,
      expiresToday,
      expired,
      missingInfo,
      totalActionRequired: expiringSoon + critical + expiresToday + expired,
    },
    statusDistribution,
    departmentData,
    trendData,
    recentRenewals,
    recentNotifications,
    urgentEmployees: evaluatedEmployees
      .filter((e: any) => e.evaluation.isActionRequired)
      .sort((a: any, b: any) => a.evaluation.urgencyRank - b.evaluation.urgencyRank)
      .slice(0, 6),
  });
}
