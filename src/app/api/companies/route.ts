import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFallbackCompanies } from "@/lib/demoStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
        commercialRegNo: true,
        logoUrl: true,
      },
      orderBy: { companyName: "asc" },
    });

    if (companies && companies.length > 0) {
      return NextResponse.json({ companies });
    }
  } catch (e) {
    console.warn("Companies query failed, using demo fallback:", e);
  }

  const fallback = getFallbackCompanies();
  return NextResponse.json({ companies: fallback });
}
