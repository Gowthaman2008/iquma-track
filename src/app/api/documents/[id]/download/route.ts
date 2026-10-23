import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const doc = await prisma.iqamaDocument.findUnique({
    where: { id },
    include: { employee: true },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Multi-tenant check
  if (user.role !== "SUPER_ADMIN" && doc.employee.companyId !== user.companyId) {
    return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
  }

  if (!fs.existsSync(doc.filePath)) {
    return NextResponse.json({ error: "File not found on storage" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(doc.filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
    },
  });
}
