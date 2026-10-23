import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const updateData: any = {
    name: body.name?.trim() || existing.name,
    role: body.role || existing.role,
  };

  if (body.password && body.password.length >= 6) {
    updateData.passwordHash = await hashPassword(body.password);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  await logAuditEvent({
    companyId: existing.companyId,
    userId: user.id,
    userName: user.name,
    action: "UPDATE",
    entityType: "SETTINGS",
    entityId: id,
    details: `Updated user profile/role for ${updated.email} to ${updated.role}`,
  });

  return NextResponse.json({
    success: true,
    user: updated,
    message: "User updated successfully.",
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: `User ${existing.email} deleted successfully.`,
  });
}
