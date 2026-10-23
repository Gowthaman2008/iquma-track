import prisma from "@/lib/prisma";
import { evaluateIqamaExpiry } from "@/lib/expiryEngine";

export interface EmailPayload {
  to: string;
  employeeName: string;
  maskedIqamaNumber: string;
  expiryDateStr: string;
  daysRemaining: number;
  statusLabel: string;
  companyName: string;
  notificationType: string;
  dashboardUrl?: string;
}

/**
 * Generate professional Saudi Green themed HTML email
 */
export function generateIqamaEmailHtml(payload: EmailPayload): string {
  const isExpired = payload.daysRemaining < 0;
  const isUrgent = payload.daysRemaining <= 7;
  const statusColor = isExpired ? "#DC2626" : isUrgent ? "#F59E0B" : "#006C35";
  const appUrl = payload.dashboardUrl || process.env.APP_URL || "http://localhost:3000";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iqama Expiry Reminder - ${payload.employeeName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F8F6; margin: 0; padding: 24px; color: #172B22; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 108, 53, 0.08); border: 1px solid #E2EBE5; }
    .header { background: linear-gradient(135deg, #004B28 0%, #006C35 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .badge-bar { background: #008C4A; padding: 6px 12px; font-size: 12px; font-weight: 600; text-align: center; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 28px; }
    .salutation { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #172B22; }
    .intro { font-size: 15px; line-height: 1.6; color: #4B5563; margin-bottom: 24px; }
    .details-card { background: #F9FCFA; border: 1px solid #E5EFE9; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #D5E4DB; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6B7C72; font-weight: 500; }
    .detail-val { font-weight: 700; color: #172B22; text-align: right; }
    .status-pill { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 13px; color: #ffffff; background: ${statusColor}; }
    .action-box { background: #EFFBF4; border-left: 4px solid #006C35; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 28px; font-size: 14px; color: #004B28; line-height: 1.5; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #006C35; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 108, 53, 0.25); }
    .footer { background: #F5F8F6; border-top: 1px solid #E5EFE9; padding: 20px; text-align: center; font-size: 12px; color: #6B7C72; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>IqamaTrack</h1>
      <p>Saudi Employee Document Management System &bull; ${payload.companyName}</p>
    </div>
    <div class="badge-bar">Official Iqama Renewal Notice</div>
    <div class="content">
      <div class="salutation">Dear ${payload.employeeName},</div>
      <div class="intro">
        This is an automated notification regarding the official expiry status of your Saudi Arabian Iqama residence permit.
        Please review the critical details below and ensure necessary renewal formalities are initiated immediately.
      </div>
      
      <div class="details-card">
        <div class="detail-row">
          <span class="detail-label">Employee Full Name</span>
          <span class="detail-val">${payload.employeeName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Iqama Number</span>
          <span class="detail-val">${payload.maskedIqamaNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Expiry Date</span>
          <span class="detail-val">${payload.expiryDateStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Timeline Status</span>
          <span class="detail-val">${payload.daysRemaining < 0 ? `${Math.abs(payload.daysRemaining)} Days Overdue` : payload.daysRemaining === 0 ? "Expires Today" : `${payload.daysRemaining} Days Remaining`}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Current Condition</span>
          <span class="detail-val"><span class="status-pill">${payload.statusLabel}</span></span>
        </div>
      </div>

      <div class="action-box">
        <strong>Required Action:</strong> Please contact your HR department or company Government Relations Officer (Muqeem / Qiwa representative) to ensure that your Iqama renewal process and health insurance requirements are finalized before the deadline to prevent Saudi Ministry of Interior penalties.
      </div>

      <div class="btn-container">
        <a href="${appUrl}/dashboard" class="btn">View Iqama in Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} IqamaTrack &bull; Automated Saudi Regulatory Expiry Tracking Engine</p>
      <p>This is a system generated notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatch an email notification and register delivery status in notification_logs.
 * Prevents duplicates via uniqueNotificationKey.
 */
export async function sendIqamaNotification(params: {
  employeeId: string;
  recipientEmail: string;
  notificationType: string;
  scheduledDate: Date;
  customSubject?: string;
  dashboardUrl?: string;
}): Promise<{ success: boolean; logId?: string; message: string; duplicate?: boolean }> {
  const { employeeId, recipientEmail, notificationType, scheduledDate, customSubject, dashboardUrl } = params;

  // 1. Fetch employee and company data
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { company: true },
  });

  if (!employee) {
    return { success: false, message: `Employee with ID ${employeeId} not found.` };
  }

  // Generate ISO date string (YYYY-MM-DD) for uniqueness
  const expiryDateIso = employee.iqamaExpiryDate.toISOString().split("T")[0];
  const uniqueNotificationKey = `${employeeId}_${expiryDateIso}_${notificationType}`;

  // 2. Check for duplicate notification
  const existingSent = await prisma.notificationLog.findUnique({
    where: { uniqueNotificationKey },
  });

  if (existingSent && existingSent.status === "SENT") {
    return {
      success: true,
      duplicate: true,
      logId: existingSent.id,
      message: `Notification ${uniqueNotificationKey} has already been sent on ${existingSent.sentAt}.`,
    };
  }

  const expiryEvaluation = evaluateIqamaExpiry(employee.iqamaExpiryDate);
  const subject =
    customSubject ||
    `[Urgent] Iqama Expiry Reminder — ${employee.fullName} (${expiryEvaluation.statusLabel})`;

  const emailHtml = generateIqamaEmailHtml({
    to: recipientEmail,
    employeeName: employee.fullName,
    maskedIqamaNumber: employee.iqamaNumberMasked,
    expiryDateStr: expiryEvaluation.formattedDate,
    daysRemaining: expiryEvaluation.daysRemaining,
    statusLabel: expiryEvaluation.statusLabel,
    companyName: employee.company?.companyName || "Saudi Enterprise",
    notificationType,
    dashboardUrl,
  });

  let status: "SENT" | "FAILED" = "SENT";
  let errorMessage: string | null = null;

  // 3. Perform sending via Resend API if configured
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && resendApiKey.startsWith("re_")) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "IqamaTrack Notifications <notifications@iqamatrack.sa>",
          to: [recipientEmail],
          subject,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        status = "FAILED";
        errorMessage = `Resend API Error (${response.status}): ${errorText}`;
      }
    } catch (err: unknown) {
      status = "FAILED";
      errorMessage = (err as Error).message || "Network error while calling Resend";
    }
  } else {
    // Sandbox / Simulation Mode for local dev: logged clearly in DB as sent preview
    status = "SENT";
    errorMessage = "Sandbox mode: Logged successfully (No external RESEND_API_KEY provided)";
  }

  // 4. Upsert persistent notification log
  const log = await prisma.notificationLog.upsert({
    where: { uniqueNotificationKey },
    create: {
      employeeId,
      notificationType,
      recipient: recipientEmail,
      scheduledDate,
      sentAt: status === "SENT" ? new Date() : null,
      status,
      errorMessage,
      uniqueNotificationKey,
    },
    update: {
      status,
      sentAt: status === "SENT" ? new Date() : null,
      errorMessage,
      recipient: recipientEmail,
    },
  });

  return {
    success: status === "SENT",
    logId: log.id,
    message: status === "SENT" ? "Notification sent successfully." : errorMessage || "Failed to send notification.",
  };
}

/**
 * Scan all active employees and evaluate which milestone notifications need to be triggered.
 * Schedules: 30d, 15d, 7d, 3d, 1d, 0d, and weekly post-expiry.
 */
export async function runAutomatedExpiryNotificationCheck(): Promise<{
  totalScanned: number;
  triggered: number;
  skippedDuplicates: number;
  errors: number;
  logs: Array<{ employeeName: string; type: string; recipient: string; status: string }>;
}> {
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: {
      company: {
        include: {
          notificationSettings: true,
        },
      },
    },
  });

  let triggered = 0;
  let skippedDuplicates = 0;
  let errors = 0;
  const logsSummary: Array<{ employeeName: string; type: string; recipient: string; status: string }> = [];

  for (const emp of employees) {
    const settings = emp.company?.notificationSettings;
    if (settings && !settings.enabled) {
      continue; // Notifications disabled for this company
    }

    const { daysRemaining } = evaluateIqamaExpiry(emp.iqamaExpiryDate);
    let notificationType: string | null = null;

    if (daysRemaining === 30) {
      notificationType = "30_DAYS";
    } else if (daysRemaining === 15) {
      notificationType = "15_DAYS";
    } else if (daysRemaining === 7) {
      notificationType = "7_DAYS";
    } else if (daysRemaining === 3) {
      notificationType = "3_DAYS";
    } else if (daysRemaining === 1) {
      notificationType = "1_DAY";
    } else if (daysRemaining === 0) {
      notificationType = "EXPIRES_TODAY";
    } else if (daysRemaining < 0 && Math.abs(daysRemaining) % 7 === 0) {
      // Weekly post-expiry reminder (e.g. at 7, 14, 21, 28 days expired)
      notificationType = `POST_EXPIRY_WEEK_${Math.abs(daysRemaining) / 7}`;
    }

    if (!notificationType) continue;

    // Determine target recipient (Employee email and/or HR contact email)
    const targetRecipients: string[] = [];
    if (emp.email) targetRecipients.push(emp.email);
    if (emp.company?.hrContactEmail && !targetRecipients.includes(emp.company.hrContactEmail)) {
      targetRecipients.push(emp.company.hrContactEmail);
    }

    for (const recipient of targetRecipients) {
      try {
        const result = await sendIqamaNotification({
          employeeId: emp.id,
          recipientEmail: recipient,
          notificationType,
          scheduledDate: new Date(),
        });

        if (result.duplicate) {
          skippedDuplicates++;
          logsSummary.push({
            employeeName: emp.fullName,
            type: notificationType,
            recipient,
            status: "DUPLICATE_SKIPPED",
          });
        } else if (result.success) {
          triggered++;
          logsSummary.push({
            employeeName: emp.fullName,
            type: notificationType,
            recipient,
            status: "SENT",
          });
        } else {
          errors++;
          logsSummary.push({
            employeeName: emp.fullName,
            type: notificationType,
            recipient,
            status: "FAILED",
          });
        }
      } catch (e: unknown) {
        errors++;
        logsSummary.push({
          employeeName: emp.fullName,
          type: notificationType,
          recipient,
          status: `ERROR: ${(e as Error).message}`,
        });
      }
    }
  }

  return {
    totalScanned: employees.length,
    triggered,
    skippedDuplicates,
    errors,
    logs: logsSummary,
  };
}
