import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const HEX_KEY = process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const KEY = Buffer.from(HEX_KEY, "hex");

function encryptIqama(plain) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

function maskIqama(iqama) {
  const clean = iqama.trim();
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

function addDaysToToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0); // Noon to prevent timezone boundary wrap
  return d;
}

async function main() {
  console.log("🌱 Starting IqamaTrack Database Seeding...");

  // Clean existing data
  await prisma.notificationLog.deleteMany();
  await prisma.iqamaRenewalHistory.deleteMany();
  await prisma.iqamaDocument.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.notificationSetting.deleteMany();
  await prisma.company.deleteMany();

  console.log("Cleared existing tables.");

  // 1. Create Companies
  const company1 = await prisma.company.create({
    data: {
      companyName: "Al-Rashid Contracting & Engineering",
      email: "info@alrashid-sa.com",
      hrContactEmail: "hr@alrashid-sa.com",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "1010482910",
      logoUrl: "/branding/company-logo.svg",
    },
  });

  const company2 = await prisma.company.create({
    data: {
      companyName: "Najd Digital Cloud Solutions",
      email: "operations@najdcloud.sa",
      hrContactEmail: "people@najdcloud.sa",
      saudiTimezone: "Asia/Riyadh",
      commercialRegNo: "4030192837",
    },
  });

  console.log(`Created 2 companies: ${company1.companyName}, ${company2.companyName}`);

  // 2. Notification Settings
  await prisma.notificationSetting.create({
    data: {
      companyId: company1.id,
      reminderDays: JSON.stringify([30, 15, 7, 3, 1, 0]),
      recipients: JSON.stringify(["EMPLOYEE", "HR_MANAGER", "SUPER_ADMIN"]),
      enabled: true,
      postExpiryFrequencyDays: 7,
    },
  });

  await prisma.notificationSetting.create({
    data: {
      companyId: company2.id,
      reminderDays: JSON.stringify([30, 15, 7, 3, 1, 0]),
      recipients: JSON.stringify(["EMPLOYEE", "HR_MANAGER"]),
      enabled: true,
      postExpiryFrequencyDays: 7,
    },
  });

  // 3. Create Users
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const hrPasswordHash = await bcrypt.hash("Hr@123456", 10);
  const employeePasswordHash = await bcrypt.hash("Employee@123456", 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Tariq Al-Mansoor",
      email: "admin@iqamatrack.sa",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      companyId: company1.id,
    },
  });

  const hrManager = await prisma.user.create({
    data: {
      name: "Fatima Al-Zahrani",
      email: "hr@iqamatrack.sa",
      passwordHash: hrPasswordHash,
      role: "HR_MANAGER",
      companyId: company1.id,
    },
  });

  const employeeUser = await prisma.user.create({
    data: {
      name: "Ahmed Khan",
      email: "ahmed.khan@iqamatrack.sa",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      companyId: company1.id,
    },
  });

  console.log("Created users: Super Admin, HR Manager, and Employee.");

  // 4. Create Realistic Employees
  const employeesData = [
    {
      employeeId: "EMP-1001",
      fullName: "Ahmed Khan",
      iqamaRaw: "2451928304",
      daysFromNow: 4, // CRITICAL (4 days remaining)
      issueDaysAgo: 360,
      email: "ahmed.khan@iqamatrack.sa",
      mobileNumber: "+966 50 123 4567",
      nationality: "Pakistan",
      department: "Engineering",
      jobPosition: "Senior Civil Engineer",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "PK987123",
      notes: "Qiwa contract renewal submitted. Awaiting labor office fee clearance.",
    },
    {
      employeeId: "EMP-1002",
      fullName: "Mohamed El-Sayed",
      iqamaRaw: "2384719283",
      daysFromNow: 0, // EXPIRES TODAY!
      issueDaysAgo: 365,
      email: "m.elsayed@alrashid-sa.com",
      mobileNumber: "+966 55 987 6543",
      nationality: "Egypt",
      department: "Finance",
      jobPosition: "Chief Financial Accountant",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "EG456123",
      notes: "URGENT: Iqama expires today. Renewal payment processed via Sadad.",
    },
    {
      employeeId: "EMP-1003",
      fullName: "Rajesh Kumar",
      iqamaRaw: "2498273615",
      daysFromNow: -14, // EXPIRED (14 days ago)
      issueDaysAgo: 380,
      email: "rajesh.k@alrashid-sa.com",
      mobileNumber: "+966 54 321 8901",
      nationality: "India",
      department: "IT & DevOps",
      jobPosition: "Network Infrastructure Lead",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "IN883921",
      notes: "Exceeded grace period by 14 days. Penalty of SAR 500 applies.",
    },
    {
      employeeId: "EMP-1004",
      fullName: "Maria Santos",
      iqamaRaw: "2512938475",
      daysFromNow: 18, // EXPIRING SOON (18 days remaining)
      issueDaysAgo: 347,
      email: "maria.s@alrashid-sa.com",
      mobileNumber: "+966 56 789 0123",
      nationality: "Philippines",
      department: "Human Resources",
      jobPosition: "Talent Acquisition Specialist",
      gender: "Female",
      status: "ACTIVE",
      passportNumber: "PH654321",
      notes: "Medical insurance renewed. Ready for Muqeem renewal submission.",
    },
    {
      employeeId: "EMP-1005",
      fullName: "Omar Al-Khatib",
      iqamaRaw: "2419283746",
      daysFromNow: 2, // CRITICAL (2 days remaining)
      issueDaysAgo: 363,
      email: "omar.khatib@alrashid-sa.com",
      mobileNumber: "+966 53 456 7890",
      nationality: "Jordan",
      department: "Operations",
      jobPosition: "Project Safety Manager",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "JO771234",
      notes: "SVP approval received for 2-year renewal.",
    },
    {
      employeeId: "EMP-1006",
      fullName: "Zainab Al-Hassan",
      iqamaRaw: "1098273645", // Saudi National Citizen ID (starts with 1)
      daysFromNow: 340, // VALID
      issueDaysAgo: 25,
      email: "zainab.h@alrashid-sa.com",
      mobileNumber: "+966 50 876 5432",
      nationality: "Saudi Arabia",
      department: "Human Resources",
      jobPosition: "Government Relations Officer (GRO)",
      gender: "Female",
      status: "ACTIVE",
      passportNumber: "SA102938",
      notes: "National ID verified. Handles Muqeem / Qiwa portals.",
    },
    {
      employeeId: "EMP-1007",
      fullName: "Suresh Pillai",
      iqamaRaw: "2471829304",
      daysFromNow: -5, // EXPIRED (5 days ago)
      issueDaysAgo: 370,
      email: "suresh.p@alrashid-sa.com",
      mobileNumber: "+966 55 112 2334",
      nationality: "India",
      department: "Logistics",
      jobPosition: "Warehouse Operations Supervisor",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "IN772819",
      notes: "First automated post-expiry reminder sent.",
    },
    {
      employeeId: "EMP-1008",
      fullName: "David Miller",
      iqamaRaw: "2538192736",
      daysFromNow: 85, // VALID (85 days)
      issueDaysAgo: 280,
      email: "david.m@alrashid-sa.com",
      mobileNumber: "+966 56 998 8776",
      nationality: "United Kingdom",
      department: "Engineering",
      jobPosition: "Technical Consulting Director",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "UK123987",
      notes: "Standard expatriate contract.",
    },
    {
      employeeId: "EMP-1009",
      fullName: "Tariq Mansour Jr",
      iqamaRaw: "2461928374",
      daysFromNow: 28, // EXPIRING SOON (28 days)
      issueDaysAgo: 337,
      email: "tariq.jr@alrashid-sa.com",
      mobileNumber: "+966 54 223 3445",
      nationality: "Lebanon",
      department: "Sales",
      jobPosition: "Key Accounts Manager",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "LB998811",
      notes: "30-day reminder email successfully delivered.",
    },
    {
      employeeId: "EMP-1010",
      fullName: "Ibrahim Mustafa",
      iqamaRaw: "2482736451",
      daysFromNow: 165, // VALID
      issueDaysAgo: 200,
      email: "i.mustafa@alrashid-sa.com",
      mobileNumber: "+966 50 334 4556",
      nationality: "Sudan",
      department: "Engineering",
      jobPosition: "Site Electrical Engineer",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "SD554433",
      notes: "Annual vacation scheduled in 4 months.",
    },
    {
      employeeId: "EMP-1011",
      fullName: "Johnathan Lee",
      iqamaRaw: "2549182736",
      daysFromNow: 6, // CRITICAL (6 days)
      issueDaysAgo: 359,
      email: "j.lee@alrashid-sa.com",
      mobileNumber: "+966 55 445 5667",
      nationality: "Singapore",
      department: "IT & DevOps",
      jobPosition: "Cloud Solutions Architect",
      gender: "Male",
      status: "ACTIVE",
      passportNumber: "SG887766",
      notes: "Awaiting final health insurance policy upload.",
    },
    {
      employeeId: "EMP-1012",
      fullName: "Noura Al-Shehri",
      iqamaRaw: "1087263548", // Saudi National Citizen
      daysFromNow: 420, // VALID
      issueDaysAgo: 10,
      email: "noura.s@alrashid-sa.com",
      mobileNumber: "+966 50 556 6778",
      nationality: "Saudi Arabia",
      department: "Finance",
      jobPosition: "Senior Financial Analyst",
      gender: "Female",
      status: "ACTIVE",
      passportNumber: "SA332211",
      notes: "Saudi national employee.",
    },
  ];

  const createdEmployees = [];

  for (const emp of employeesData) {
    const expiryDate = addDaysToToday(emp.daysFromNow);
    const issueDate = addDaysToToday(-emp.issueDaysAgo);

    const created = await prisma.employee.create({
      data: {
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        iqamaNumberEncrypted: encryptIqama(emp.iqamaRaw),
        iqamaNumberMasked: maskIqama(emp.iqamaRaw),
        iqamaExpiryDate: expiryDate,
        iqamaIssueDate: issueDate,
        email: emp.email,
        mobileNumber: emp.mobileNumber,
        nationality: emp.nationality,
        department: emp.department,
        jobPosition: emp.jobPosition,
        gender: emp.gender,
        status: emp.status,
        passportNumber: emp.passportNumber,
        notes: emp.notes,
        companyId: company1.id,
      },
    });

    createdEmployees.push(created);
  }

  console.log(`Created ${createdEmployees.length} realistic employee records.`);

  // 5. Add sample Renewal History records for some employees
  const renewedEmp1 = createdEmployees[0]; // Ahmed Khan
  await prisma.iqamaRenewalHistory.create({
    data: {
      employeeId: renewedEmp1.id,
      previousExpiryDate: addDaysToToday(-360),
      newExpiryDate: addDaysToToday(4),
      renewalDate: addDaysToToday(-360),
      updatedById: hrManager.id,
      updatedByName: hrManager.name,
      cost: 9500.0,
      notes: "Renewed for 1 year. Maktab Amal fee SAR 9600 + Iqama fee SAR 650.",
    },
  });

  const renewedEmp8 = createdEmployees[7]; // David Miller
  await prisma.iqamaRenewalHistory.create({
    data: {
      employeeId: renewedEmp8.id,
      previousExpiryDate: addDaysToToday(-280),
      newExpiryDate: addDaysToToday(85),
      renewalDate: addDaysToToday(-280),
      updatedById: superAdmin.id,
      updatedByName: superAdmin.name,
      cost: 10250.0,
      notes: "Premium expatriate tier Iqama renewal processed via Muqeem portal.",
    },
  });

  console.log("Created renewal history records.");

  // 6. Add sample Notification Logs
  const expiryDateIso0 = createdEmployees[0].iqamaExpiryDate.toISOString().split("T")[0];
  await prisma.notificationLog.create({
    data: {
      employeeId: createdEmployees[0].id,
      notificationType: "7_DAYS",
      recipient: createdEmployees[0].email,
      scheduledDate: addDaysToToday(-3),
      sentAt: addDaysToToday(-3),
      status: "SENT",
      uniqueNotificationKey: `${createdEmployees[0].id}_${expiryDateIso0}_7_DAYS`,
    },
  });

  const expiryDateIso8 = createdEmployees[8].iqamaExpiryDate.toISOString().split("T")[0];
  await prisma.notificationLog.create({
    data: {
      employeeId: createdEmployees[8].id,
      notificationType: "30_DAYS",
      recipient: createdEmployees[8].email,
      scheduledDate: addDaysToToday(-2),
      sentAt: addDaysToToday(-2),
      status: "SENT",
      uniqueNotificationKey: `${createdEmployees[8].id}_${expiryDateIso8}_30_DAYS`,
    },
  });

  // Expired employee log
  const expiryDateIso2 = createdEmployees[2].iqamaExpiryDate.toISOString().split("T")[0];
  await prisma.notificationLog.create({
    data: {
      employeeId: createdEmployees[2].id,
      notificationType: "POST_EXPIRY_WEEK_1",
      recipient: createdEmployees[2].email,
      scheduledDate: addDaysToToday(-7),
      sentAt: addDaysToToday(-7),
      status: "SENT",
      uniqueNotificationKey: `${createdEmployees[2].id}_${expiryDateIso2}_POST_EXPIRY_WEEK_1`,
    },
  });

  console.log("Created initial notification logs.");

  // 7. Audit Log entries
  await prisma.auditLog.create({
    data: {
      companyId: company1.id,
      userId: superAdmin.id,
      userName: superAdmin.name,
      action: "LOGIN",
      entityType: "AUTH",
      details: "Super Admin logged in from Riyadh IP address",
    },
  });

  await prisma.auditLog.create({
    data: {
      companyId: company1.id,
      userId: hrManager.id,
      userName: hrManager.name,
      action: "CREATE",
      entityType: "EMPLOYEE",
      entityId: createdEmployees[0].id,
      details: "Added new employee Ahmed Khan (EMP-1001)",
    },
  });

  console.log("Created audit logs.");
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
