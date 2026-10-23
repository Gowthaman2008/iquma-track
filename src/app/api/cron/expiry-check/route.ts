import { NextResponse } from "next/server";
import { runAutomatedExpiryNotificationCheck } from "@/lib/emailService";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Check authorization: Either via CRON_SECRET or logged in HR / Super Admin
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "iqama_cron_secret_saudi_2026";

    let isAuthorized = false;
    if (authHeader && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else {
      const user = await getCurrentUser();
      if (user && (user.role === "SUPER_ADMIN" || user.role === "HR_MANAGER")) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const report = await runAutomatedExpiryNotificationCheck();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report,
      message: `Expiry engine check complete. Scanned ${report.totalScanned} employees, triggered ${report.triggered} notifications, skipped ${report.skippedDuplicates} duplicates.`,
    });
  } catch (error: any) {
    console.error("Cron expiry check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute automated expiry check." },
      { status: 500 }
    );
  }
}

// Allow GET for easy status/ping
export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "IqamaTrack Automated Expiry Notification Engine",
    schedule: "Daily at 08:00 AM Asia/Riyadh",
    milestones: ["30 days", "15 days", "7 days", "3 days", "1 day", "0 days (Expiry Day)", "Weekly Post-Expiry"],
  });
}
