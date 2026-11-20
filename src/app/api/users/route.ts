import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "HR_MANAGER")) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["SUPER_ADMIN", "HR_MANAGER"],
      },
    },
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
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "HR_MANAGER")) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role, companyId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required administrator fields." }, { status: 400 });
    }

    // Admins only
    const validRoles = ["SUPER_ADMIN", "HR_MANAGER"];
    const targetRole = validRoles.includes(role) ? role : "HR_MANAGER";

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "An administrator with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const targetCompanyId = companyId || (await prisma.company.findFirst())?.id;

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: targetRole,
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
      details: `Created new ${newUser.role} administrator: ${newUser.email}`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "Admin account created successfully. They can now log in to this dashboard.",
    });
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: error.message || "Failed to create administrator." }, { status: 500 });
  }
}
