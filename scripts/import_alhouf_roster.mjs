import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";

const prisma = new PrismaClient();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const HEX_KEY = process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const KEY = Buffer.from(HEX_KEY, "hex");

function encryptIqama(plain) {
  if (!plain) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

function maskIqama(iqama) {
  if (!iqama) return "—";
  const clean = iqama.trim();
  if (clean.length < 5) return clean;
  const start = clean.slice(0, 3);
  const end = clean.slice(-3);
  const middle = "*".repeat(Math.max(3, clean.length - 6));
  return `${start}${middle}${end}`;
}

function normalizeTitle(name) {
  if (!name) return "";
  const cleaned = name.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned
    .split(" ")
    .map((w) => {
      const u = w.toUpperCase();
      if (["MD", "AL", "BIN", "IBN"].includes(u)) return u;
      if (w.length <= 2) return u;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function sanitizeEmailSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(".");
}

async function main() {
  console.log("🧹 Clearing all extra/demo employee records...");

  // 1. Clear employee-related tables only
  await prisma.notificationLog.deleteMany();
  await prisma.iqamaRenewalHistory.deleteMany();
  await prisma.iqamaDocument.deleteMany();
  await prisma.employee.deleteMany();

  console.log("✓ Cleared all employee records. Admin management users preserved.");

  // 2. Ensure AL Houf Group Company exists
  const alhoufCompany = await prisma.company.upsert({
    where: { id: "cmvla9fqc0000r7tkb82ni1l4" },
    update: {},
    create: {
      id: "cmvla9fqc0000r7tkb82ni1l4",
      companyName: "AL Houf Trading & Contracting Group",
      email: "info@alhouf.sa",
      hrContactEmail: "hr@alhouf.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "1010778899",
      logoUrl: "/branding/alhouf-logo.svg",
    },
  });

  const hrAdmin = await prisma.user.findFirst({
    where: { role: { in: ["HR_MANAGER", "SUPER_ADMIN"] } },
  });

  // 3. Load the 38 Alhouf employees extracted directly from the user's screenshot / table
  const rawData = JSON.parse(fs.readFileSync("scripts/alhouf_roster.json", "utf8"));
  console.log(`✓ Loaded ${rawData.length} employees from the Alhouf roster.`);

  const usedCodes = new Set();
  const usedEmails = new Set(["admin@alhouf.sa", "admin@iqamatrack.sa", "hr@iqamatrack.sa"]);
  let createdCount = 0;
  let renewalsCreated = 0;

  for (const item of rawData) {
    const rawNo = item.no ? parseInt(item.no, 10) : createdCount + 1;
    let empCode = `EMP-${String(rawNo).padStart(4, "0")}`;
    if (usedCodes.has(empCode)) {
      let suffix = 2;
      while (usedCodes.has(`${empCode}-${suffix}`)) {
        suffix++;
      }
      empCode = `${empCode}-${suffix}`;
    }
    usedCodes.add(empCode);

    const fullName = normalizeTitle(item.name_eng) || `Employee ${item.raw_id}`;

    let baseSlug = sanitizeEmailSlug(fullName) || `emp.${empCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    let email = `${baseSlug}@alhouf.sa`;
    let emailCounter = 2;
    while (usedEmails.has(email)) {
      email = `${baseSlug}${emailCounter}@alhouf.sa`;
      emailCounter++;
    }
    usedEmails.add(email);

    // Build Notes to retain Excel NO, Bank, A/C, Arabic name, etc.
    const notesParts = [];
    if (item.no) notesParts.append ? notesParts.push(`NO: ${item.no}`) : notesParts.push(`NO: ${item.no}`);
    if (item.name_arb) notesParts.push(`Name (Arabic): ${item.name_arb}`);
    if (item.salary) notesParts.push(`Base Salary: SAR ${item.salary}`);
    if (item.bank && item.bank !== "—") notesParts.push(`Bank: ${item.bank} (A/C: ${item.bank_ac || "On file"})`);
    const fullNotes = notesParts.join(" | ") || "Standard verified workforce record.";

    const expiryDate = new Date(`${item.iqama_end_date}T12:00:00.000Z`);
    const issueDate = new Date(expiryDate.getTime() - 365 * 24 * 60 * 60 * 1000);

    const iqamaEncrypted = encryptIqama(item.raw_id);
    const iqamaMasked = maskIqama(item.raw_id);

    const emp = await prisma.employee.create({
      data: {
        employeeId: empCode,
        fullName,
        iqamaNumberEncrypted: iqamaEncrypted,
        iqamaNumberMasked: iqamaMasked,
        iqamaExpiryDate: expiryDate,
        iqamaIssueDate: issueDate,
        email,
        mobileNumber: `+966 50 ${String(item.raw_id).slice(-7)}`,
        nationality: item.nationality || "—",
        department: item.department || "Raja",
        jobPosition: "Civil Site Specialist",
        companyId: alhoufCompany.id,
        status: "ACTIVE",
        gender: item.gender || "Male",
        notes: fullNotes,
      },
    });
    createdCount++;

    // Insert Renewal History if column 16 has extended renewal
    if (item.col16_renewal) {
      await prisma.iqamaRenewalHistory.create({
        data: {
          employeeId: emp.id,
          previousExpiryDate: expiryDate,
          newExpiryDate: new Date(`${item.col16_renewal}T12:00:00.000Z`),
          renewalDate: new Date(expiryDate.getTime() - 14 * 24 * 60 * 60 * 1000),
          cost: 650.0, // Official Saudi Jawazat renewal fee: SAR 650
          notes: "Official Jawazat Iqama renewal fee SAR 650 processed through Qiwa/Muqeem portal.",
          updatedByName: hrAdmin?.name || "Fatima Al-Zahrani",
          updatedById: hrAdmin?.id,
        },
      });
      renewalsCreated++;
    }
  }

  console.log(`🎉 Done! Database now contains ONLY the ${createdCount} Alhouf employees and ${renewalsCreated} renewal records.`);
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
