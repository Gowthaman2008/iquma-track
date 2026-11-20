import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function clean() {
  await prisma.notificationLog.deleteMany();
  await prisma.iqamaRenewalHistory.deleteMany();
  await prisma.iqamaDocument.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany({ where: { role: "EMPLOYEE" } });

  const company = await prisma.company.findFirst();
  const companyId = company ? company.id : "cmvla9fqc0000r7tkb82ni1l4";

  const adminAlhouf = await prisma.user.findUnique({ where: { email: "admin@alhouf.sa" } });
  if (!adminAlhouf) {
    const passwordHash = await bcrypt.hash("Admin@123456", 10);
    await prisma.user.create({
      data: {
        id: "admin_alhouf_001",
        name: "AL Houf Administrator",
        email: "admin@alhouf.sa",
        passwordHash,
        role: "SUPER_ADMIN",
        companyId,
      },
    });
  }

  const empCount = await prisma.employee.count();
  const renewalCount = await prisma.iqamaRenewalHistory.count();
  const notifCount = await prisma.notificationLog.count();
  const users = await prisma.user.findMany({ select: { email: true, role: true } });

  console.log("Employees remaining:", empCount);
  console.log("Renewals remaining:", renewalCount);
  console.log("Notifications remaining:", notifCount);
  console.log("Users remaining:", users);
}

clean()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
