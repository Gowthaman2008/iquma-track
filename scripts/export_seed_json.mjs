import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function exportAll() {
  const companies = await prisma.company.findMany();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, companyId: true },
  });
  const employees = await prisma.employee.findMany({
    include: {
      company: { select: { id: true, companyName: true } },
      documents: { select: { id: true, fileName: true, mimeType: true, uploadedAt: true } },
      renewalHistory: true,
    },
    orderBy: { iqamaExpiryDate: "asc" },
  });
  const renewals = await prisma.iqamaRenewalHistory.findMany({
    include: {
      employee: {
        select: { id: true, fullName: true, employeeId: true, iqamaNumberMasked: true },
      },
    },
    orderBy: { renewalDate: "desc" },
  });

  const outDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    companies,
    users,
    employees,
    renewals,
  };

  const targetFile = path.join(outDir, "seed-data.json");
  fs.writeFileSync(targetFile, JSON.stringify(payload, null, 2), "utf-8");
  console.log("Successfully exported seed data to:", targetFile);
  console.log({
    companies: companies.length,
    users: users.length,
    employees: employees.length,
    renewals: renewals.length,
  });
}

exportAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
