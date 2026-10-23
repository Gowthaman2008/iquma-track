import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import fs from "fs";
import path from "path";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Only HR or Admins can upload documents." }, { status: 403 });
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPG, and PNG documents are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB maximum limit." },
        { status: 400 }
      );
    }

    // Secure local storage directory outside public root
    const uploadDir = path.join(process.cwd(), "data", "uploads", "documents", employee.id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".png");
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
    const destinationPath = path.join(uploadDir, uniqueFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destinationPath, buffer);

    const docRecord = await prisma.iqamaDocument.create({
      data: {
        employeeId: employee.id,
        fileName: uniqueFileName,
        originalName: file.name,
        filePath: destinationPath,
        mimeType: file.type,
        fileSize: file.size,
        uploadedBy: user.name,
      },
    });

    await logAuditEvent({
      companyId: employee.companyId,
      userId: user.id,
      userName: user.name,
      action: "UPLOAD",
      entityType: "DOCUMENT",
      entityId: docRecord.id,
      details: `Uploaded document "${file.name}" for employee ${employee.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully.",
      document: docRecord,
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload document." },
      { status: 500 }
    );
  }
}
