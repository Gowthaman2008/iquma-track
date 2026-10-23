import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE",
      companyId: user.companyId,
      companyName: user.company?.companyName,
    };

    const token = generateToken(sessionPayload);

    // Audit log
    await logAuditEvent({
      companyId: user.companyId,
      userId: user.id,
      userName: user.name,
      action: "LOGIN",
      entityType: "AUTH",
      details: `User ${user.email} (${user.role}) logged in successfully.`,
    });

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
