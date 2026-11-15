import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      companyName: true,
      commercialRegNo: true,
      logoUrl: true,
    },
    orderBy: { companyName: "asc" },
  });

  return NextResponse.json({ companies });
}
