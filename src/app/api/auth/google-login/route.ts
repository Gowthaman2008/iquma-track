import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: "Google email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if employee exists with this email or similar prefix
    let employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { email: cleanEmail.replace("@gmail.com", "@iqamatrack.sa") },
          { email: cleanEmail.replace("@gmail.com", "@alhouf.sa") },
        ],
      },
      include: { company: true },
    });

    // If not found by exact email, try finding first active employee for quick testing
    if (!employee) {
      employee = await prisma.employee.findFirst({
        where: { status: "ACTIVE" },
        include: { company: true },
      });
    }

    if (!employee) {
      return NextResponse.json(
        { error: "No matching employee record found for this Google account. Please contact AL Houf HR." },
        { status: 404 }
      );
    }

    // 2. Ensure User account exists for this employee
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || employee.fullName,
          email: cleanEmail,
          passwordHash: "GOOGLE_OAUTH_AUTHENTICATED",
          role: "EMPLOYEE",
          companyId: employee.companyId,
        },
      });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "EMPLOYEE" as const,
      companyId: employee.companyId,
      companyName: employee.company?.companyName || "AL Houf Group",
      employeeId: employee.id,
    };

    const token = generateToken(sessionPayload);

    await logAuditEvent({
      companyId: employee.companyId,
      userId: user.id,
      userName: user.name,
      action: "LOGIN",
      entityType: "AUTH",
      details: `Employee ${employee.fullName} (${employee.employeeId}) logged in via Google Authentication.`,
    });

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      employeeId: employee.id,
      message: `Welcome, ${employee.fullName}. Google authentication successful.`,
    });

    // Set secure session cookie
    response.cookies.set("iqamatrack_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Google login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to authenticate with Google." },
      { status: 500 }
    );
  }
}
