import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptIqamaNumber, maskIqamaNumber } from "@/lib/crypto";
import { logAuditEvent } from "@/lib/audit";
import Papa from "papaparse";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Only HR or Admins can import records." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawText = formData.get("text") as string | null;

    let csvContent = "";
    if (file) {
      csvContent = await file.text();
    } else if (rawText) {
      csvContent = rawText;
    } else {
      return NextResponse.json({ error: "No CSV file or text provided." }, { status: 400 });
    }

    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json({ error: "CSV parsing error", details: parsed.errors }, { status: 400 });
    }

    const rows = parsed.data as Array<Record<string, string>>;
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    const defaultCompany = await prisma.company.findFirst({
      where: user.role === "SUPER_ADMIN" ? {} : { id: user.companyId || "" },
    });

    if (!defaultCompany) {
      return NextResponse.json({ error: "No company available for import." }, { status: 400 });
    }

    for (const [index, row] of rows.entries()) {
      const rowNum = index + 2;
      const fullName = row["Full Name"] || row["fullName"] || row["Name"] || row["name"];
      const employeeId = row["Employee ID"] || row["employeeId"] || row["ID"] || row["id"];
      const iqamaNumber = row["Iqama Number"] || row["iqamaNumber"] || row["Iqama"] || row["iqama"];
      const expiryDateStr = row["Expiry Date"] || row["expiryDate"] || row["Iqama Expiry Date"];
      const email = row["Email"] || row["email"] || `${employeeId?.toLowerCase() || 'emp'}@company.sa`;
      const department = row["Department"] || row["department"] || "General";
      const nationality = row["Nationality"] || row["nationality"] || "Other";
      const mobileNumber = row["Mobile"] || row["mobileNumber"] || row["Phone"] || "";
      const jobPosition = row["Job Position"] || row["jobPosition"] || row["Position"] || "Staff";

      if (!fullName || !employeeId || !iqamaNumber || !expiryDateStr) {
        skipped++;
        errors.push(`Row ${rowNum}: Missing mandatory fields (Full Name, Employee ID, Iqama Number, Expiry Date).`);
        continue;
      }

      // Check duplicate employee ID
      const existing = await prisma.employee.findUnique({
        where: { employeeId: employeeId.trim() },
      });

      if (existing) {
        skipped++;
        errors.push(`Row ${rowNum}: Employee ID "${employeeId}" already exists.`);
        continue;
      }

      const expiryDate = new Date(expiryDateStr.trim());
      if (isNaN(expiryDate.getTime())) {
        skipped++;
        errors.push(`Row ${rowNum}: Invalid expiry date format "${expiryDateStr}". Use YYYY-MM-DD.`);
        continue;
      }

      const encryptedIqama = encryptIqamaNumber(iqamaNumber.trim());
      const maskedIqama = maskIqamaNumber(iqamaNumber.trim());

      await prisma.employee.create({
        data: {
          employeeId: employeeId.trim(),
          fullName: fullName.trim(),
          iqamaNumberEncrypted: encryptedIqama,
          iqamaNumberMasked: maskedIqama,
          iqamaExpiryDate: expiryDate,
          iqamaIssueDate: new Date(),
          email: email.trim().toLowerCase(),
          mobileNumber: mobileNumber.trim(),
          nationality: nationality.trim(),
          department: department.trim(),
          jobPosition: jobPosition.trim(),
          companyId: defaultCompany.id,
          status: "ACTIVE",
        },
      });

      imported++;
    }

    await logAuditEvent({
      companyId: defaultCompany.id,
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entityType: "EMPLOYEE",
      details: `Imported ${imported} employees via CSV (${skipped} skipped).`,
    });

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 10),
      message: `Successfully imported ${imported} employee records. ${skipped} skipped.`,
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: error.message || "Failed to process CSV file." }, { status: 500 });
  }
}
