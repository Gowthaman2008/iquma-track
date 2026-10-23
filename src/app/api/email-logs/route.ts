import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ALL";
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { recipient: { contains: search } },
      { uniqueNotificationKey: { contains: search } },
      { employee: { fullName: { contains: search } } },
      { employee: { employeeId: { contains: search } } },
    ];
  }

  const logs = await prisma.notificationLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          fullName: true,
          employeeId: true,
          iqamaNumberMasked: true,
          company: {
            select: { companyName: true },
          },
        },
      },
    },
    take: 100,
  });

  const totalLogs = await prisma.notificationLog.count({ where });

  return NextResponse.json({
    logs,
    total: totalLogs,
  });
}
