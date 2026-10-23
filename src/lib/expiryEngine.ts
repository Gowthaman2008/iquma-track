/**
 * Iqama Expiry Tracking Engine
 *
 * Provides timezone-aware (Asia/Riyadh) calculations for Saudi Iqama dates.
 * Prevents off-by-one errors by comparing calendar dates at midnight in Riyadh time.
 */

export type ExpiryStatus =
  | "VALID"
  | "EXPIRING_SOON"
  | "CRITICAL"
  | "EXPIRES_TODAY"
  | "EXPIRED";

export interface ExpiryCalculationResult {
  daysRemaining: number;
  status: ExpiryStatus;
  statusLabel: string;
  badgeClass: string;
  badgeBg: string;
  badgeText: string;
  urgencyRank: number; // 0 = Expired, 1 = Expires Today, 2 = Critical, 3 = Expiring Soon, 4 = Valid
  formattedDate: string;
  formattedIssueDate?: string;
  isExpired: boolean;
  isActionRequired: boolean;
}

const RIYADH_TIMEZONE = "Asia/Riyadh";

/**
 * Returns a Date object representing the calendar date (at 00:00:00) in Riyadh time.
 */
function getMidnightInRiyadh(dateInput: Date | string): Date {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  
  // Format into YYYY-MM-DD using Asia/Riyadh timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: RIYADH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value || "1970";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";

  // Use UTC midnight for exact day delta calculation
  return new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)));
}

/**
 * Calculate the exact number of days remaining until Iqama expiry from today in Riyadh timezone.
 */
export function calculateDaysRemaining(
  expiryDate: Date | string,
  referenceDate?: Date | string
): number {
  const targetMidnight = getMidnightInRiyadh(expiryDate);
  const nowMidnight = referenceDate ? getMidnightInRiyadh(referenceDate) : getMidnightInRiyadh(new Date());

  const diffMs = targetMidnight.getTime() - nowMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine the expiry status according to Saudi Iqama regulations.
 */
export function getExpiryStatus(daysRemaining: number): ExpiryStatus {
  if (daysRemaining < 0) {
    return "EXPIRED";
  } else if (daysRemaining === 0) {
    return "EXPIRES_TODAY";
  } else if (daysRemaining >= 1 && daysRemaining <= 7) {
    return "CRITICAL";
  } else if (daysRemaining >= 8 && daysRemaining <= 30) {
    return "EXPIRING_SOON";
  } else {
    return "VALID";
  }
}

/**
 * Full analysis of an Iqama expiry date
 */
export function evaluateIqamaExpiry(
  expiryDate: Date | string,
  issueDate?: Date | string | null,
  referenceDate?: Date | string
): ExpiryCalculationResult {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);
  const status = getExpiryStatus(daysRemaining);

  const dateObj = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: RIYADH_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateObj);

  let formattedIssueDate = undefined;
  if (issueDate) {
    const issueObj = typeof issueDate === "string" ? new Date(issueDate) : issueDate;
    formattedIssueDate = new Intl.DateTimeFormat("en-GB", {
      timeZone: RIYADH_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(issueObj);
  }

  let statusLabel = "";
  let badgeClass = "";
  let badgeBg = "";
  let badgeText = "";
  let urgencyRank = 4;
  let isExpired = false;
  let isActionRequired = false;

  switch (status) {
    case "EXPIRED":
      statusLabel = `Expired (${Math.abs(daysRemaining)}d ago)`;
      badgeClass = "bg-red-950/20 text-red-600 border border-red-300 dark:border-red-800";
      badgeBg = "#991B1B";
      badgeText = "#FFFFFF";
      urgencyRank = 0;
      isExpired = true;
      isActionRequired = true;
      break;

    case "EXPIRES_TODAY":
      statusLabel = "Expires Today!";
      badgeClass = "bg-red-500 text-white animate-pulse font-bold shadow-sm";
      badgeBg = "#DC2626";
      badgeText = "#FFFFFF";
      urgencyRank = 1;
      isActionRequired = true;
      break;

    case "CRITICAL":
      statusLabel = `Critical (${daysRemaining}d left)`;
      badgeClass = "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300";
      badgeBg = "#DC2626";
      badgeText = "#FFFFFF";
      urgencyRank = 2;
      isActionRequired = true;
      break;

    case "EXPIRING_SOON":
      statusLabel = `Expiring Soon (${daysRemaining}d left)`;
      badgeClass = "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300";
      badgeBg = "#F59E0B";
      badgeText = "#FFFFFF";
      urgencyRank = 3;
      isActionRequired = true;
      break;

    case "VALID":
    default:
      statusLabel = `Valid (${daysRemaining}d left)`;
      badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300";
      badgeBg = "#16A34A";
      badgeText = "#FFFFFF";
      urgencyRank = 4;
      break;
  }

  return {
    daysRemaining,
    status,
    statusLabel,
    badgeClass,
    badgeBg,
    badgeText,
    urgencyRank,
    formattedDate,
    formattedIssueDate,
    isExpired,
    isActionRequired,
  };
}
