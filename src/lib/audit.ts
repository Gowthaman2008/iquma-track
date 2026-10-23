import prisma from "@/lib/prisma";

export async function logAuditEvent(params: {
  companyId?: string | null;
  userId?: string | null;
  userName?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "RENEW" | "LOGIN" | "EXPORT" | "NOTIFY" | "UPLOAD";
  entityType: "EMPLOYEE" | "DOCUMENT" | "RENEWAL" | "SETTINGS" | "AUTH" | "REPORT";
  entityId?: string | null;
  details?: Record<string, unknown> | string;
}) {
  try {
    const detailsStr =
      typeof params.details === "object"
        ? JSON.stringify(params.details)
        : params.details || null;

    await prisma.auditLog.create({
      data: {
        companyId: params.companyId,
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: detailsStr,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
