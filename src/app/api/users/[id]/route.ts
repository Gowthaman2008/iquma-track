import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "HR_MANAGER")) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
  }

  const validRoles = ["SUPER_ADMIN", "HR_MANAGER"];
  const targetRole = body.role && validRoles.includes(body.role) ? body.role : existing.role;

  const updateData: any = {
    name: body.name?.trim() || existing.name,
    role: targetRole,
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
    details: `Updated admin profile/role for ${updated.email} to ${updated.role}`,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    user: updated,
    message: "Admin account updated successfully.",
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "HR_MANAGER")) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
  }

  await prisma.user.delete({
    where: { id },
  });

  await logAuditEvent({
    companyId: existing.companyId,
    userId: user.id,
    userName: user.name,
    action: "DELETE",
    entityType: "SETTINGS",
    entityId: id,
    details: `Deleted admin account: ${existing.email}`,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: `Admin account ${existing.email} removed successfully.`,
  });
}
