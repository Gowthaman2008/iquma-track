import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      company: {
        select: { companyName: true },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role, companyId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required user fields." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const targetCompanyId = companyId || (await prisma.company.findFirst())?.id;

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        companyId: targetCompanyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await logAuditEvent({
      companyId: targetCompanyId,
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entityType: "SETTINGS",
      entityId: newUser.id,
      details: `Created new ${newUser.role} user: ${newUser.email}`,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "User account created successfully.",
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user." }, { status: 500 });
  }
}
