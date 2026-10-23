"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RenewModal } from "@/components/modals/RenewModal";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  AlertCircle,
  FileQuestion,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Mail,
  UserPlus,
  Calendar,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [renewTarget, setRenewTarget] = useState<{ id: string; name: string; expiry: string } | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-2xl" />
            <div className="h-80 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const metrics = data?.metrics || {
    totalEmployees: 0,
    activeIqamas: 0,
    expiringSoon: 0,
    critical: 0,
    expiresToday: 0,
    expired: 0,
    missingInfo: 0,
  };

  const statCards = [
    {
      title: "Total Employees",
      value: metrics.totalEmployees,
      desc: "All registered workers",
      icon: Users,
      color: "border-blue-500",
      bgIcon: "bg-blue-50 text-blue-600",
      trend: "+100% compliant",
    },
    {
      title: "Active Iqamas",
      value: metrics.activeIqamas,
      desc: "Valid & permitted in KSA",
      icon: ShieldCheck,
      color: "border-[#006C35]",
      bgIcon: "bg-emerald-50 text-[#006C35]",
      trend: "Regulatory valid",
    },
    {
      title: "Expiring Soon",
      value: metrics.expiringSoon + metrics.critical,
      desc: "Expires in ≤30 days",
      icon: AlertTriangle,
      color: "border-amber-500",
      bgIcon: "bg-amber-50 text-amber-600",
      trend: `${metrics.critical} critical (≤7d)`,
      highlight: (metrics.expiringSoon + metrics.critical) > 0,
    },
    {
      title: "Expired Iqamas",
      value: metrics.expired,
      desc: "Overdue (Penalties Apply)",
      icon: AlertCircle,
      color: "border-red-600",
      bgIcon: "bg-red-50 text-red-600",
      trend: metrics.expired > 0 ? "Requires Immediate Action" : "Zero expired",
      highlight: metrics.expired > 0,
    },
    {
      title: "Missing Info",
      value: metrics.missingInfo,
      desc: "Missing passport or details",
      icon: FileQuestion,
      color: "border-purple-500",
      bgIcon: "bg-purple-50 text-purple-600",
      trend: "Profile completion",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome & Quick Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Executive Iqama Intelligence
            </h1>
            <p className="text-xs text-[#6B7C72] mt-0.5">
              Real-time Saudi labor compliance, Muqeem expiry monitoring, and automated notices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/employees/new"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-md shadow-[#006C35]/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#E2ECE5] text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <Calendar className="w-4 h-4 text-[#006C35]" />
              <span>Expiry Calendar</span>
            </Link>
          </div>
        </div>

        {/* 5 Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-4 border border-[#E2ECE5] shadow-xs hover:shadow-md transition relative overflow-hidden ${
                  card.highlight ? "ring-2 ring-red-400/30" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className="text-3xl font-black text-gray-900 mt-1 tracking-tight">
                      {card.value}
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.bgIcon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{card.desc}</span>
                  <span className={`font-semibold ${card.highlight ? "text-red-600" : "text-[#006C35]"}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Urgent Action Banner if Any Iqama is Expired or Expires Today */}
        {(metrics.expired > 0 || metrics.expiresToday > 0 || metrics.critical > 0) && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide">
                  Attention Required: {metrics.expired} Expired &bull; {metrics.expiresToday} Expiring Today &bull; {metrics.critical} Critical (≤7 Days)
                </h4>
                <p className="text-xs text-white/90 mt-0.5">
                  Ministry of Interior (Jawazat) penalties start at SAR 500 per month for delayed renewals.
                </p>
              </div>
            </div>
            <Link
              href="/employees?expiryStatus=CRITICAL"
              className="px-4 py-2 bg-white text-red-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition shrink-0 shadow-sm"
            >
              Resolve Critical Records &rarr;
            </Link>
          </div>
        )}

        {/* Dashboard Charts: Grid of 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Expiry Status Breakdown (Donut) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECE5] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Iqama Expiry Distribution</h3>
                <p className="text-xs text-gray-500">Breakdown of active residence permits by urgency</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(data?.statusDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Employees`, name]}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #E2ECE5" }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Expiry Forecast */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECE5] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Monthly Expiry Forecast (Next 6 Months)</h3>
                <p className="text-xs text-gray-500">Upcoming renewals timeline and workload</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #E2ECE5" }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="valid" name="Valid" fill="#006C35" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expiring" name="Expiring Soon" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expired" name="Expired" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Breakdown & Urgent Employees Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Distribution Chart */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECE5] shadow-xs lg:col-span-1">
            <h3 className="font-bold text-sm text-gray-900 mb-1">Employees by Department</h3>
            <p className="text-xs text-gray-500 mb-4">Workforce distribution across divisions</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.departmentData || []}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F2" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Bar dataKey="count" name="Staff" fill="#008C4A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Urgent Attention Employees */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECE5] shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Immediate Expiry Watchlist</h3>
                <p className="text-xs text-gray-500">Iqamas requiring renewal or notification action</p>
              </div>
              <Link
                href="/employees"
                className="text-xs font-semibold text-[#006C35] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[10px] bg-gray-50/50">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Iqama No.</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.urgentEmployees?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        All employee Iqamas are currently valid with &gt; 30 days remaining!
                      </td>
                    </tr>
                  ) : (
                    data?.urgentEmployees?.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-2.5 px-3">
                          <Link href={`/employees/${emp.id}`} className="font-semibold text-gray-900 hover:text-[#006C35]">
                            {emp.fullName}
                          </Link>
                          <div className="text-[10px] text-gray-500">{emp.department} &bull; {emp.employeeId}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-700">
                          {emp.iqamaNumberMasked}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-800">
                          {emp.evaluation.formattedDate}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge
                            status={emp.evaluation.status}
                            daysRemaining={emp.evaluation.daysRemaining}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5">
                          <button
                            onClick={() =>
                              setRenewTarget({
                                id: emp.id,
                                name: emp.fullName,
                                expiry: emp.evaluation.formattedDate,
                              })
                            }
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#006C35] text-white hover:bg-[#004B28] transition"
                          >
                            Renew
                          </button>
                          <Link
                            href={`/employees/${emp.id}`}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-100 inline-block"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Renewals & Recent Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Renewals */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECE5] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#006C35]" />
                <span>Recently Renewed Iqamas</span>
              </h3>
              <Link href="/renewals" className="text-xs text-[#006C35] hover:underline">
                View history
              </Link>
            </div>
            <div className="space-y-2">
              {data?.recentRenewals?.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">No recent renewal history recorded yet.</p>
              ) : (
                data?.recentRenewals?.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{r.employee?.fullName}</p>
                      <p className="text-[11px] text-gray-500">
                        Updated by {r.updatedByName || "HR"} &bull; {new Date(r.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700">
                        {r.cost ? `SAR ${r.cost.toLocaleString()}` : "SAR 9,650"}
                      </span>
                      <p className="text-[10px] text-gray-500">
                        New Expiry: {new Date(r.newExpiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recently Dispatched Notifications */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECE5] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#006C35]" />
                <span>Recent Expiry Email Reminders</span>
              </h3>
              <Link href="/email-logs" className="text-xs text-[#006C35] hover:underline">
                View email logs
              </Link>
            </div>
            <div className="space-y-2">
              {data?.recentNotifications?.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">No notification logs recorded yet.</p>
              ) : (
                data?.recentNotifications?.map((n: any) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{n.employee?.fullName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#004B28]">
                          {n.notificationType}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-xs">{n.recipient}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        n.status === "SENT" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        {n.status}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {n.sentAt ? new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Renew Modal */}
      {renewTarget && (
        <RenewModal
          isOpen={true}
          onClose={() => setRenewTarget(null)}
          employeeId={renewTarget.id}
          employeeName={renewTarget.name}
          currentExpiryStr={renewTarget.expiry}
          onSuccess={fetchDashboardData}
        />
      )}
    </AppLayout>
  );
}
