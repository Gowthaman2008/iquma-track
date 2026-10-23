import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const whereEmployee: any = {};
  if (user.role !== "SUPER_ADMIN" && user.companyId) {
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

  const totalCost = renewals.reduce((acc, r) => acc + (r.cost || 0), 0);

  return NextResponse.json({
    renewals,
    totalCount: renewals.length,
    totalCost,
  });
}
