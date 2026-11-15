import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
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
  console.log("🌱 Starting Comprehensive Enterprise Demo Seeding...");

  // 1. Clear existing records
  await prisma.notificationLog.deleteMany();
  await prisma.iqamaRenewalHistory.deleteMany();
  await prisma.iqamaDocument.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.notificationSetting.deleteMany();
  await prisma.company.deleteMany();

  console.log("Cleared existing database tables.");

  // 2. Create the 3 main enterprise companies + Najd Digital
  const companyAlhouf = await prisma.company.create({
    data: {
      id: "cmvla9fqc0000r7tkb82ni1l4",
      companyName: "AL Houf Trading & Contracting Group",
      email: "info@alhouf.sa",
      hrContactEmail: "hr@alhouf.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "1010778899",
      logoUrl: "/branding/alhouf-logo.svg",
    },
  });

  const companySidrat = await prisma.company.create({
    data: {
      id: "cmvsidratalkhaleej001",
      companyName: "Sidrat Al Khaleej for Contracting",
      email: "info@sidrat.sa",
      hrContactEmail: "hr@sidrat.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "1010889900",
      logoUrl: "/branding/alhouf-logo.svg",
    },
  });

  const companyAlhouf2 = await prisma.company.create({
    data: {
      id: "cmvalhouf2contracting001",
      companyName: "AL Houf 2 Contracting",
      email: "branch2@alhouf.sa",
      hrContactEmail: "hr2@alhouf.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "1010778898",
      logoUrl: "/branding/alhouf-logo.svg",
    },
  });

  const companyNajd = await prisma.company.create({
    data: {
      id: "cmvla9fql0001r7tkxf06zrqp",
      companyName: "Najd Digital Cloud Solutions",
      email: "operations@najdcloud.sa",
      hrContactEmail: "people@najdcloud.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "4030192837",
    },
  });

  console.log("Created 4 enterprise companies: AL Houf, Sidrat Al Khaleej, AL Houf 2, Najd Digital.");

  // 3. Notification settings for each company
  const defaultSettings = {
    reminderDays: JSON.stringify([30, 15, 7, 3, 1, 0]),
    recipients: JSON.stringify(["EMPLOYEE", "HR_MANAGER", "SUPER_ADMIN"]),
    enabled: true,
    postExpiryFrequencyDays: 7,
  };

  await prisma.notificationSetting.create({ data: { companyId: companyAlhouf.id, ...defaultSettings } });
  await prisma.notificationSetting.create({ data: { companyId: companySidrat.id, ...defaultSettings } });
  await prisma.notificationSetting.create({ data: { companyId: companyAlhouf2.id, ...defaultSettings } });
  await prisma.notificationSetting.create({ data: { companyId: companyNajd.id, ...defaultSettings } });

  // 4. Create Standard Demo Users
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const hrPasswordHash = await bcrypt.hash("Hr@123456", 10);
  const employeePasswordHash = await bcrypt.hash("Employee@123456", 10);

  const superAdmin = await prisma.user.create({
    data: {
      id: "cmvla9g0z0007r7tkvd1qm748",
      name: "Tariq Al-Mansoor",
      email: "admin@iqamatrack.sa",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      companyId: companyAlhouf.id,
    },
  });

  const hrManager = await prisma.user.create({
    data: {
      id: "cmvla9g2l0009r7tku2ysgdf1",
      name: "Fatima Al-Zahrani",
      email: "hr@iqamatrack.sa",
      passwordHash: hrPasswordHash,
      role: "HR_MANAGER",
      companyId: companyAlhouf.id,
    },
  });

  const empUser1 = await prisma.user.create({
    data: {
      id: "cmvlaq99a0003r7p05u331pg7",
      name: "Ahmed Khan",
      email: "ahmed.khan@alhouf.sa",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      companyId: companyAlhouf.id,
    },
  });

  const empUser2 = await prisma.user.create({
    data: {
      id: "cmvla9g2t000br7tkv09ufvy2",
      name: "Ahmed Khan",
      email: "ahmed.khan@iqamatrack.sa",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      companyId: companyAlhouf.id,
    },
  });

  // Additional 1-click Google accounts
  await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "maria.s@alhouf.sa",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      companyId: companyAlhouf.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Omar Al-Khatib",
      email: "omar.khatib@alhouf.sa",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      companyId: companyAlhouf.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Zainab Al-Hassan",
      email: "zainab.h@alhouf.sa",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      companyId: companyAlhouf.id,
    },
  });

  console.log("Created Super Admin, HR Manager, and Demo Employee credentials.");

  // Also seed primary test employee Ahmed Khan (EMP-1001) for 1-click employee login
  const ahmedKhanEmp = await prisma.employee.create({
    data: {
      employeeId: "EMP-1001",
      fullName: "Ahmed Khan",
      iqamaNumberEncrypted: encryptIqama("2451928304"),
      iqamaNumberMasked: maskIqama("2451928304"),
      iqamaExpiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Critical (4 days)
      iqamaIssueDate: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000),
      email: "ahmed.khan@alhouf.sa",
      mobileNumber: "+966 50 123 4567",
      nationality: "Pakistan",
      department: "Head Office",
      jobPosition: "Senior Civil Engineer",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "PK987123",
      notes: "Primary demo employee. Qiwa contract renewal submitted. Awaiting labor office fee clearance.",
      companyId: companyAlhouf.id,
    },
  });

  // 5. Load and insert all extracted employees
  const rawData = JSON.parse(fs.readFileSync("scripts/extracted_employees.json", "utf8"));
  console.log(`Loaded ${rawData.length} extracted employees from JSON.`);

  const usedEmails = new Set(["ahmed.khan@alhouf.sa", "ahmed.khan@iqamatrack.sa", "admin@iqamatrack.sa", "hr@iqamatrack.sa", "maria.s@alhouf.sa", "omar.khatib@alhouf.sa", "zainab.h@alhouf.sa"]);
  const usedEmpCodes = new Set(["EMP-1001"]);

  let createdCount = 0;
  let renewalCount = 0;
  let notificationCount = 0;

  for (const item of rawData) {
    // 1. Resolve Company
    let targetCompany = companyAlhouf;
    const coLower = (item.companyName || "").toLowerCase();
    if (coLower.includes("sidrat")) {
      targetCompany = companySidrat;
    } else if (coLower.includes("2")) {
      targetCompany = companyAlhouf2;
    }

    // 2. Resolve Unique Employee Code
    let empCode = item.employeeCode;
    if (usedEmpCodes.has(empCode)) {
      let suffix = 2;
      while (usedEmpCodes.has(`${empCode}-${suffix}`)) {
        suffix++;
      }
      empCode = `${empCode}-${suffix}`;
    }
    usedEmpCodes.add(empCode);

    // 3. Resolve Unique Email
    const domain = targetCompany.id === companySidrat.id ? "sidrat.sa" : "alhouf.sa";
    let baseSlug = sanitizeEmailSlug(item.fullName) || `emp.${empCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    let email = `${baseSlug}@${domain}`;
    let emailCounter = 2;
    while (usedEmails.has(email)) {
      email = `${baseSlug}${emailCounter}@${domain}`;
      emailCounter++;
    }
    usedEmails.add(email);

    // 4. Resolve Dates
    const expDateStr = item.expiryDate || "2027-01-01";
    const expiryDate = new Date(`${expDateStr}T12:00:00.000Z`);
    let issueDate;
    if (item.isSaudi) {
      issueDate = new Date("2021-01-01T12:00:00.000Z");
    } else {
      issueDate = new Date(expiryDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    // 5. Deterministic Mobile & Passport
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

    // 6. Encrypt & Mask Iqama
    const rawIqama = item.rawId || `25${(hash % 90000000 + 10000000)}`;
    const iqamaEncrypted = encryptIqama(rawIqama);
    const iqamaMasked = maskIqama(rawIqama);

    // 7. Insert Employee
    const created = await prisma.employee.create({
      data: {
        employeeId: empCode,
        fullName: item.fullName,
        iqamaNumberEncrypted: iqamaEncrypted,
        iqamaNumberMasked: iqamaMasked,
        iqamaExpiryDate: expiryDate,
        iqamaIssueDate: issueDate,
        email,
        mobileNumber,
        nationality: item.nationality || "Other",
        department: item.department || "Raja",
        jobPosition: item.jobPosition || "Staff Specialist",
        gender: item.gender || "Male",
        status: "ACTIVE",
        passportNumber,
        notes: item.notes,
        companyId: targetCompany.id,
      },
    });

    createdCount++;

    // 8. Create Renewal History if present
    if (item.renewals && item.renewals.length > 0) {
      for (const ren of item.renewals) {
        await prisma.iqamaRenewalHistory.create({
          data: {
            employeeId: created.id,
            previousExpiryDate: new Date(`${ren.previous}T12:00:00.000Z`),
            newExpiryDate: new Date(`${ren.new}T12:00:00.000Z`),
            renewalDate: new Date(`${ren.previous}T12:00:00.000Z`),
            updatedById: hrManager.id,
            updatedByName: hrManager.name,
            cost: ren.cost || 9650.0,
            notes: ren.notes || "Annual Iqama renewal processed via Muqeem portal.",
          },
        });
        renewalCount++;
      }
    }

    // 9. Generate realistic Notification Logs for Expired / Critical / Expiring Soon employees
    const today = new Date("2026-11-15T12:00:00.000Z");
    const daysDiff = Math.round((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      // Overdue - post expiry alert
      const expiryIso = expiryDate.toISOString().split("T")[0];
      await prisma.notificationLog.create({
        data: {
          employeeId: created.id,
          notificationType: "POST_EXPIRY_WEEKLY",
          recipient: created.email,
          scheduledDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
          sentAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
          status: "SENT",
          uniqueNotificationKey: `${created.id}_${expiryIso}_POST_EXPIRY_WEEKLY`,
        },
      });
      notificationCount++;
    } else if (daysDiff <= 7) {
      // Critical 7-day reminder
      const expiryIso = expiryDate.toISOString().split("T")[0];
      await prisma.notificationLog.create({
        data: {
          employeeId: created.id,
          notificationType: "7_DAYS",
          recipient: created.email,
          scheduledDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
          sentAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
          status: "SENT",
          uniqueNotificationKey: `${created.id}_${expiryIso}_7_DAYS`,
        },
      });
      notificationCount++;
    } else if (daysDiff <= 30) {
      // 30-day reminder
      const expiryIso = expiryDate.toISOString().split("T")[0];
      await prisma.notificationLog.create({
        data: {
          employeeId: created.id,
          notificationType: "30_DAYS",
          recipient: created.email,
          scheduledDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
          sentAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
          status: "SENT",
          uniqueNotificationKey: `${created.id}_${expiryIso}_30_DAYS`,
        },
      });
      notificationCount++;
    }
  }

  // 10. Audit Log
  await prisma.auditLog.create({
    data: {
      companyId: companyAlhouf.id,
      userId: superAdmin.id,
      userName: superAdmin.name,
      action: "CREATE",
      entityType: "EMPLOYEE",
      details: `Batch imported ${createdCount} demo employees from official company dataset across AL Houf, Sidrat Al Khaleej, and AL Houf 2.`,
    },
  });

  console.log(`\n========================================`);
  console.log(`🎉 SUCCESS: Database populated with real dataset!`);
  console.log(`   Employees Created:   ${createdCount + 1}`);
  console.log(`   Renewals Logged:     ${renewalCount}`);
  console.log(`   Notifications Sent:  ${notificationCount}`);
  console.log(`   Companies Active:    4`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
