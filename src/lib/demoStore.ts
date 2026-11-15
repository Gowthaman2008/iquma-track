import seedData from "../data/seedData";
import { evaluateIqamaExpiry } from "./expiryEngine";
import { maskIqamaNumber } from "./crypto";

export interface DemoCompany {
  id: string;
  companyName: string;
  email: string;
  hrContactEmail?: string | null;
  saudiTimezone: string;
  commercialRegNo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoEmployee {
  id: string;
  employeeId: string;
  fullName: string;
  iqamaNumberEncrypted: string;
  iqamaNumberMasked: string;
  iqamaExpiryDate: string;
  iqamaIssueDate?: string | null;
  jobPosition: string;
  department: string;
  email: string;
  mobileNumber?: string | null;
  nationality: string;
  status: string;
  companyId: string;
  company?: { id: string; companyName: string };
  passportNumber?: string | null;
  dob?: string | null;
  gender?: string | null;
  notes?: string | null;
  documents?: any[];
  renewalHistory?: any[];
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent caches for Serverless lifecycle
let cachedCompanies: DemoCompany[] = [...(seedData.companies as unknown as any[])];
let cachedEmployees: DemoEmployee[] = [...(seedData.employees as unknown as any[])];
let cachedRenewals: any[] = [...(seedData.renewals as unknown as any[])];

export function getFallbackCompanies() {
  return cachedCompanies;
}

export function getFallbackCompanyById(id: string) {
  return cachedCompanies.find((c) => c.id === id) || null;
}

export function getFallbackEmployees(filters: {
  search?: string;
  companyId?: string;
  department?: string;
  nationality?: string;
  status?: string;
  expiryStatus?: string;
  userRole?: string;
  userCompanyId?: string | null;
}) {
  let list = [...cachedEmployees];

  // Tenancy: if regular employee or company-restricted role
  if (
    filters.userRole !== "SUPER_ADMIN" &&
    filters.userRole !== "HR_MANAGER" &&
    filters.userCompanyId
  ) {
    list = list.filter((e) => e.companyId === filters.userCompanyId);
  } else if (filters.companyId && filters.companyId !== "ALL") {
    list = list.filter((e) => e.companyId === filters.companyId);
  }

  // Department filter
  if (filters.department && filters.department !== "ALL") {
    list = list.filter((e) => e.department === filters.department);
  }

  // Nationality filter
  if (filters.nationality && filters.nationality !== "ALL") {
    list = list.filter((e) => e.nationality === filters.nationality);
  }

  // Status filter (ACTIVE, INACTIVE, VACATION)
  if (filters.status && filters.status !== "ALL") {
    list = list.filter((e) => e.status === filters.status);
  }

  // Live evaluation
  let evaluated = list.map((emp) => {
    const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate, emp.iqamaIssueDate);
    return {
      ...emp,
      evaluation,
    };
  });

  // Expiry Status filter
  if (filters.expiryStatus && filters.expiryStatus !== "ALL") {
    evaluated = evaluated.filter((e) => e.evaluation.status === filters.expiryStatus);
  }

  // Search filter
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    evaluated = evaluated.filter((e) => {
      if (e.fullName.toLowerCase().includes(q)) return true;
      if (e.employeeId.toLowerCase().includes(q)) return true;
      if (e.email.toLowerCase().includes(q)) return true;
      if (e.iqamaNumberMasked.includes(q)) return true;
      if (e.department?.toLowerCase().includes(q)) return true;
      if (e.nationality?.toLowerCase().includes(q)) return true;
      if (e.notes?.toLowerCase().includes(q)) return true;

      // Numeric Iqama queries
      if (/^\d+$/.test(q)) {
        const maskedQuery = maskIqamaNumber(q);
        if (e.iqamaNumberMasked.includes(maskedQuery)) return true;
        if (q.length >= 3) {
          const start = q.slice(0, 3);
          const end = q.slice(-3);
          if (e.iqamaNumberMasked.startsWith(start) && e.iqamaNumberMasked.endsWith(end)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  // Sort by expiry date ascending
  evaluated.sort(
    (a, b) => new Date(a.iqamaExpiryDate).getTime() - new Date(b.iqamaExpiryDate).getTime()
  );

  return evaluated;
}

export function getFallbackEmployeeById(id: string) {
  const emp = cachedEmployees.find((e) => e.id === id || e.employeeId === id);
  if (!emp) return null;

  const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate, emp.iqamaIssueDate);
  const company = cachedCompanies.find((c) => c.id === emp.companyId) || {
    id: emp.companyId,
    companyName: "AL Houf Trading & Contracting Group",
  };

  const empRenewals = cachedRenewals.filter((r) => r.employeeId === emp.id);

  return {
    ...emp,
    company,
    evaluation,
    documents: emp.documents || [],
    renewalHistory: empRenewals.length > 0 ? empRenewals : (emp.renewalHistory || []),
  };
}

export function addFallbackEmployee(newEmp: any) {
  const id = newEmp.id || `emp_gen_${Date.now()}`;
  const record: DemoEmployee = {
    ...newEmp,
    id,
    iqamaNumberMasked: newEmp.iqamaNumberMasked || maskIqamaNumber(newEmp.iqamaNumber || "2500000000"),
    iqamaNumberEncrypted: newEmp.iqamaNumberEncrypted || "ENC_DEMO",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents: [],
    renewalHistory: [],
  };
  cachedEmployees.unshift(record);
  return record;
}

export function updateFallbackEmployee(id: string, updates: any) {
  const idx = cachedEmployees.findIndex((e) => e.id === id || e.employeeId === id);
  if (idx === -1) return null;

  cachedEmployees[idx] = {
    ...cachedEmployees[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return cachedEmployees[idx];
}

export function deleteFallbackEmployee(id: string) {
  const idx = cachedEmployees.findIndex((e) => e.id === id || e.employeeId === id);
  if (idx === -1) return false;
  cachedEmployees.splice(idx, 1);
  return true;
}

export function getFallbackRenewals() {
  return cachedRenewals;
}

export function addFallbackRenewal(data: {
  employeeId: string;
  newExpiryDate: string;
  cost?: number;
  notes?: string;
  updatedByName?: string;
}) {
  const emp = cachedEmployees.find((e) => e.id === data.employeeId);
  const prevExpiry = emp?.iqamaExpiryDate || new Date().toISOString();

  const renewalRecord = {
    id: `ren_${Date.now()}`,
    employeeId: data.employeeId,
    previousExpiryDate: prevExpiry,
    newExpiryDate: data.newExpiryDate,
    renewalDate: new Date().toISOString(),
    cost: data.cost || 9650,
    notes: data.notes || "Standard Jawazat renewal",
    updatedByName: data.updatedByName || "HR Manager",
    employee: emp ? {
      id: emp.id,
      fullName: emp.fullName,
      employeeId: emp.employeeId,
      iqamaNumberMasked: emp.iqamaNumberMasked,
    } : null,
  };

  cachedRenewals.unshift(renewalRecord);

  if (emp) {
    emp.iqamaExpiryDate = data.newExpiryDate;
    emp.updatedAt = new Date().toISOString();
  }

  return renewalRecord;
}

export function getFallbackDashboardStats(user?: { role?: string; companyId?: string | null }) {
  let list = [...cachedEmployees];
  if (user?.role !== "SUPER_ADMIN" && user?.role !== "HR_MANAGER" && user?.companyId) {
    list = list.filter((e) => e.companyId === user.companyId);
  }

  let totalEmployees = list.length;
  let activeIqamas = 0;
  let expiringSoon = 0;
  let critical = 0;
  let expiresToday = 0;
  let expired = 0;
  let missingInfo = 0;

  const departmentCounts: Record<string, number> = {};
  const monthlyTrends: Record<string, { month: string; valid: number; expiring: number; expired: number }> = {};

  const now = new Date();
  for (let i = -1; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthlyTrends[key] = { month: key, valid: 0, expiring: 0, expired: 0 };
  }

  const evaluated = list.map((emp) => {
    const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate, emp.iqamaIssueDate);

    if (emp.status === "ACTIVE") activeIqamas++;

    if (evaluation.status === "EXPIRED") expired++;
    else if (evaluation.status === "EXPIRES_TODAY") expiresToday++;
    else if (evaluation.status === "CRITICAL") critical++;
    else if (evaluation.status === "EXPIRING_SOON") expiringSoon++;

    if (!emp.passportNumber || !emp.dob || !emp.gender) {
      missingInfo++;
    }

    const dept = emp.department || "General Operations";
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

    const expDate = new Date(emp.iqamaExpiryDate);
    const monthKey = expDate.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (monthlyTrends[monthKey]) {
      if (evaluation.status === "EXPIRED") monthlyTrends[monthKey].expired++;
      else if (evaluation.status === "CRITICAL" || evaluation.status === "EXPIRING_SOON") {
        monthlyTrends[monthKey].expiring++;
      } else {
        monthlyTrends[monthKey].valid++;
      }
    }

    return {
      ...emp,
      evaluation,
    };
  });

  const departmentData = Object.entries(departmentCounts)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  const statusDistribution = [
    { name: "Valid (>30d)", value: totalEmployees - (expiringSoon + critical + expiresToday + expired), color: "#16A34A" },
    { name: "Expiring Soon (8-30d)", value: expiringSoon, color: "#F59E0B" },
    { name: "Critical (1-7d)", value: critical + expiresToday, color: "#DC2626" },
    { name: "Expired", value: expired, color: "#991B1B" },
  ];

  const urgentEmployees = evaluated
    .filter((e) => e.evaluation.status !== "VALID")
    .sort((a, b) => a.evaluation.daysRemaining - b.evaluation.daysRemaining)
    .slice(0, 10);

  const recentRenewals = cachedRenewals.slice(0, 5);

  return {
    metrics: {
      totalEmployees,
      activeIqamas,
      expiringSoon,
      critical,
      expiresToday,
      expired,
      missingInfo,
    },
    statusDistribution,
    departmentData,
    trendData: Object.values(monthlyTrends),
    urgentEmployees,
    recentRenewals,
  };
}

export function getFallbackCalendarEvents(year: number, month: number) {
  const events: any[] = [];

  cachedEmployees.forEach((emp) => {
    const expDate = new Date(emp.iqamaExpiryDate);
    if (expDate.getFullYear() === year && expDate.getMonth() + 1 === month) {
      const evaluation = evaluateIqamaExpiry(emp.iqamaExpiryDate, emp.iqamaIssueDate);
      const day = expDate.getDate();
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      let badgeColor = "#16A34A";
      let statusLabel = "Valid";
      if (evaluation.status === "EXPIRED") {
        badgeColor = "#991B1B";
        statusLabel = "Expired";
      } else if (evaluation.status === "EXPIRES_TODAY") {
        badgeColor = "#EF4444";
        statusLabel = "Expires Today!";
      } else if (evaluation.status === "CRITICAL") {
        badgeColor = "#DC2626";
        statusLabel = "Critical (≤7d)";
      } else if (evaluation.status === "EXPIRING_SOON") {
        badgeColor = "#F59E0B";
        statusLabel = "Expiring Soon";
      }

      events.push({
        id: `cal_${emp.id}`,
        employeeId: emp.id,
        employeeCode: emp.employeeId,
        title: `${emp.fullName} (${emp.employeeId})`,
        dateStr,
        day,
        status: evaluation.status,
        statusLabel,
        badgeColor,
        department: emp.department,
        maskedIqama: emp.iqamaNumberMasked,
        companyName: emp.company?.companyName || "AL Houf Trading & Contracting",
      });
    }
  });

  return events;
}

export function getFallbackPortalInfo(userEmail: string) {
  const cleanEmail = userEmail.toLowerCase().trim();
  const emp =
    cachedEmployees.find((e) => e.email.toLowerCase() === cleanEmail) ||
    cachedEmployees[0]; // Ahmed Khan fallback if specific match not found

  if (!emp) return null;

  return getFallbackEmployeeById(emp.id);
}
