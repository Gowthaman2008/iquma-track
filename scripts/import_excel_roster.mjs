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

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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
  console.log("🚀 Starting Excel Employee Roster Database Import...");

  // 1. Ensure Companies exist
  const companyAlhouf = await prisma.company.upsert({
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

  const companySidrat = await prisma.company.upsert({
    where: { id: "cmvsidratalkhaleej001" },
    update: {},
    create: {
      id: "cmvsidratalkhaleej001",
      companyName: "Sidrat Al Khaleej for Contracting",
      email: "info@sidrat.sa",
      hrContactEmail: "hr@sidrat.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "1010889900",
      logoUrl: "/branding/alhouf-logo.svg",
    },
  });

  const companyAlhouf2 = await prisma.company.upsert({
    where: { id: "cmvalhouf2contracting001" },
    update: {},
    create: {
      id: "cmvalhouf2contracting001",
      companyName: "AL Houf 2 Contracting",
      email: "branch2@alhouf.sa",
      hrContactEmail: "hr2@alhouf.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "1010778898",
      logoUrl: "/branding/alhouf-logo.svg",
    },
  });

  // 2. Clear employee tables only (leave User admin accounts untouched)
  await prisma.notificationLog.deleteMany();
  await prisma.iqamaRenewalHistory.deleteMany();
  await prisma.iqamaDocument.deleteMany();
  await prisma.employee.deleteMany();
  console.log("✓ Cleared prior employee records. Admin users preserved.");

  // 3. Load extracted Excel employees
  const rawData = JSON.parse(fs.readFileSync("scripts/extracted_employees.json", "utf8"));
  console.log(`✓ Loaded ${rawData.length} employees from extracted Excel dataset.`);

  const hrAdmin = await prisma.user.findFirst({
    where: { role: { in: ["HR_MANAGER", "SUPER_ADMIN"] } },
  });

  const usedEmails = new Set(["admin@alhouf.sa", "admin@iqamatrack.sa", "hr@iqamatrack.sa"]);
  const usedCodes = new Set();
  let createdCount = 0;
  let renewalsCreated = 0;

  for (const item of rawData) {
    // Resolve Company
    let targetCompanyId = companyAlhouf.id;
    const coLower = (item.companyName || "").toLowerCase();
    if (coLower.includes("sidrat")) {
      targetCompanyId = companySidrat.id;
    } else if (coLower.includes("2")) {
      targetCompanyId = companyAlhouf2.id;
    }

    // Resolve Unique Employee Code
    let empCode = item.employeeCode || `EMP-${createdCount + 1001}`;
    if (usedCodes.has(empCode)) {
      let suffix = 2;
      while (usedCodes.has(`${empCode}-${suffix}`)) {
        suffix++;
      }
      empCode = `${empCode}-${suffix}`;
    }
    usedCodes.add(empCode);

    // Resolve Unique Email
    const domain = targetCompanyId === companySidrat.id ? "sidrat.sa" : "alhouf.sa";
    let baseSlug = sanitizeEmailSlug(item.fullName) || `emp.${empCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    let email = `${baseSlug}@${domain}`;
    let emailCounter = 2;
    while (usedEmails.has(email)) {
      email = `${baseSlug}${emailCounter}@${domain}`;
      emailCounter++;
    }
    usedEmails.add(email);

    // Resolve Dates
    const expDateStr = item.expiryDate || "2027-01-01";
    const expiryDate = new Date(`${expDateStr}T12:00:00.000Z`);
    let issueDate;
    if (item.isSaudi) {
      issueDate = new Date("2021-01-01T12:00:00.000Z");
    } else {
      issueDate = new Date(expiryDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    // Deterministic Mobile & Passport
    const hash = stringHash(`${item.rawId || empCode}`);
    const mobileDigits = (hash % 9000000 + 1000000).toString();
    const mobileNumber = `+966 50 ${mobileDigits.slice(0, 3)} ${mobileDigits.slice(3)}`;

    const countryCodeMap = {
      India: "Z",
      Bangladesh: "A",
      Pakistan: "PK",
      Sudan: "SD",
      Egypt: "EG",
      Morocco: "MC",
      "Saudi Arabia": "SA",
      "Sri Lanka": "N",
      Yemen: "Y",
    };
    const prefix = countryCodeMap[item.nationality] || "P";
    const passportDigits = (hash % 900000 + 100000).toString();
    const passportNumber = `${prefix}${passportDigits}`;

    // Encrypt & Mask Iqama
    const rawIqama = item.rawId || `25${(hash % 90000000 + 10000000)}`;
    const iqamaEncrypted = encryptIqama(rawIqama);
    const iqamaMasked = maskIqama(rawIqama);

    const emp = await prisma.employee.create({
      data: {
        employeeId: empCode,
        fullName: item.fullName,
        iqamaNumberEncrypted: iqamaEncrypted,
        iqamaNumberMasked: iqamaMasked,
        iqamaExpiryDate: expiryDate,
        iqamaIssueDate: issueDate,
        email,
        mobileNumber,
        nationality: item.nationality || "Saudi Arabia",
        department: item.department || "Head Office",
        jobPosition: item.jobPosition || "Specialist",
        companyId: targetCompanyId,
        status: "ACTIVE",
        gender: item.gender || "Male",
        passportNumber,
        notes: item.notes,
      },
    });
    createdCount++;

    // Insert Renewals if any (using official fee SAR 650)
    if (item.renewals && item.renewals.length > 0) {
      for (const ren of item.renewals) {
        const renDate = new Date(ren.new);
        const processedDate = new Date(renDate.getTime() - 14 * 24 * 60 * 60 * 1000);
        await prisma.iqamaRenewalHistory.create({
          data: {
            employeeId: emp.id,
            previousExpiryDate: new Date(`${ren.previous}T12:00:00.000Z`),
            newExpiryDate: new Date(`${ren.new}T12:00:00.000Z`),
            renewalDate: processedDate,
            cost: 650.0, // Official Saudi Jawazat renewal fee: SAR 650
            notes: "Official Jawazat Iqama renewal fee SAR 650 processed through Qiwa/Muqeem portal.",
            updatedByName: hrAdmin?.name || "Fatima Al-Zahrani",
            updatedById: hrAdmin?.id,
          },
        });
        renewalsCreated++;
      }
    }
  }

  console.log(`🎉 Successfully imported ${createdCount} employees and ${renewalsCreated} renewal records into the database!`);
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
