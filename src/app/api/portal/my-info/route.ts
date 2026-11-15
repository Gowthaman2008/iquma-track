import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";
import { getFallbackPortalInfo } from "@/lib/demoStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    // Look for employee matching user email or first employee of the company
    let employee = await prisma.employee.findFirst({
      where: {
        email: user.email.toLowerCase().trim(),
      },
      include: {
        company: true,
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        renewalHistory: {
          orderBy: { renewalDate: "desc" },
        },
        notificationLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!employee) {
      employee = await prisma.employee.findFirst({
        where: { status: "ACTIVE" },
        include: {
          company: true,
          documents: {
            orderBy: { uploadedAt: "desc" },
          },
          renewalHistory: {
            orderBy: { renewalDate: "desc" },
          },
          notificationLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (employee) {
      const evaluation = evaluateIqamaExpiry(employee.iqamaExpiryDate, employee.iqamaIssueDate);
      return NextResponse.json({
        employee: {
          ...employee,
          evaluation,
        },
        userRole: user.role,
      });
    }
  } catch (e) {
    console.warn("Portal query failed, using demo fallback:", e);
  }

  const fallback = getFallbackPortalInfo(user.email);
  if (!fallback) {
    return NextResponse.json({ error: "No employee record found." }, { status: 404 });
  }

  return NextResponse.json({
    employee: fallback,
    userRole: user.role,
  });
}
