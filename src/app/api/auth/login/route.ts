import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Built-in demo accounts guaranteed to work in all environments (local, Vercel serverless, etc.)
const DEMO_ACCOUNTS: Record<
  string,
  {
    id: string;
    name: string;
    password: string;
    role: "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE";
    companyId: string;
    companyName: string;
  }
> = {
  "admin@iqamatrack.sa": {
    id: "cmvla9g0z0007r7tkvd1qm748",
    name: "Tariq Al-Mansoor",
    password: "Admin@123456",
    role: "SUPER_ADMIN",
    companyId: "cmvla9fqc0000r7tkb82ni1l4",
    companyName: "AL Houf Trading & Contracting Group",
  },
  "hr@iqamatrack.sa": {
    id: "cmvla9g2l0009r7tku2ysgdf1",
    name: "Fatima Al-Zahrani",
    password: "Hr@123456",
    role: "HR_MANAGER",
    companyId: "cmvla9fqc0000r7tkb82ni1l4",
    companyName: "AL Houf Trading & Contracting Group",
  },
  "ahmed.khan@alhouf.sa": {
    id: "cmvlaq99a0003r7p05u331pg7",
    name: "Ahmed Khan",
    password: "Employee@123456",
    role: "EMPLOYEE",
    companyId: "cmvla9fqc0000r7tkb82ni1l4",
    companyName: "AL Houf Trading & Contracting Group",
  },
  "ahmed.khan@iqamatrack.sa": {
    id: "cmvla9g2t000br7tkv09ufvy2",
    name: "Ahmed Khan",
    password: "Employee@123456",
    role: "EMPLOYEE",
    companyId: "cmvla9fqc0000r7tkb82ni1l4",
    companyName: "AL Houf Trading & Contracting Group",
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const demoAccount = DEMO_ACCOUNTS[cleanEmail];

    let sessionPayload: {
      id: string;
      name: string;
      email: string;
      role: "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE";
      companyId: string | null;
      companyName?: string;
    } | null = null;

    // 1. Attempt database authentication if available
    try {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { company: true },
      });

      if (user) {
        const isMatch = await verifyPassword(password, user.passwordHash);
        if (isMatch) {
          sessionPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE",
            companyId: user.companyId,
            companyName: user.company?.companyName || "AL Houf Trading & Contracting Group",
          };
        }
      }
    } catch (dbError) {
      console.warn("Database lookup error during login (falling back to demo handler if applicable):", dbError);
    }

    // 2. If not authenticated via DB, check demo accounts fallback
    if (!sessionPayload && demoAccount && password === demoAccount.password) {
      sessionPayload = {
        id: demoAccount.id,
        name: demoAccount.name,
        email: cleanEmail,
        role: demoAccount.role,
        companyId: demoAccount.companyId,
        companyName: demoAccount.companyName,
      };
    }

    if (!sessionPayload) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    const token = generateToken(sessionPayload);

    // Audit log (fail-safe so logging never breaks authentication)
    try {
      await logAuditEvent({
        companyId: sessionPayload.companyId,
        userId: sessionPayload.id,
        userName: sessionPayload.name,
        action: "LOGIN",
        entityType: "AUTH",
        details: `User ${sessionPayload.email} (${sessionPayload.role}) logged in successfully.`,
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr);
    }

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: "Login successful.",
    });

    // Set secure HTTP-only cookie
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
    response.cookies.set("iqamatrack_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during authentication." },
      { status: 500 }
    );
  }
}
