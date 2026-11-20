import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFallbackRenewals } from "@/lib/demoStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const whereEmployee: any = {};
    if (user.role !== "SUPER_ADMIN" && user.role !== "HR_MANAGER" && user.companyId) {
      whereEmployee.companyId = user.companyId;
    }

    const renewals = await prisma.iqamaRenewalHistory.findMany({
      where: {
        employee: whereEmployee,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            iqamaNumberMasked: true,
            department: true,
            company: { select: { companyName: true } },
          },
        },
        updatedByUser: {
          select: { name: true, email: true },
        },
      },
      orderBy: { renewalDate: "desc" },
    });

    if (renewals && renewals.length > 0) {
      const totalCost = (renewals as any[]).reduce((acc: number, r: any) => acc + (r.cost || 0), 0);
      return NextResponse.json({
        renewals,
        totalCount: renewals.length,
        totalCost,
      });
    }

    return NextResponse.json({
      renewals: [],
      totalCount: 0,
      totalCost: 0,
    });
  } catch (e) {
    console.warn("Renewals query failed:", e);
    return NextResponse.json({
      renewals: [],
      totalCount: 0,
      totalCost: 0,
    });
  }
}
