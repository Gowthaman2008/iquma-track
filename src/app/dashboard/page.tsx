"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
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
} from "recharts";

// Custom Modern Tooltip for Charts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3 text-xs z-50">
        {label && <p className="font-bold text-slate-800 mb-1.5">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center gap-2 text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="font-medium text-slate-500">{entry.name}:</span>
            <span className="font-bold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 rounded-2xl" />
            <div className="h-80 bg-slate-200 rounded-2xl" />
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
      accentGradient: "from-blue-500 to-indigo-500",
      bgIcon: "bg-blue-50 text-blue-600 border border-blue-100",
      badgeStyle: "bg-blue-50 text-blue-700 border border-blue-200/60",
      trend: "100% Compliant",
    },
    {
      title: "Active Iqamas",
      value: metrics.activeIqamas,
      desc: "Valid & permitted in KSA",
      icon: ShieldCheck,
      accentGradient: "from-emerald-500 to-teal-500",
      bgIcon: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      badgeStyle: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      trend: "Fully Valid",
    },
    {
      title: "Expiring Soon",
      value: metrics.expiringSoon + metrics.critical,
      desc: "Expires in ≤30 days",
      icon: AlertTriangle,
      accentGradient: "from-amber-400 to-orange-500",
      bgIcon: "bg-amber-50 text-amber-600 border border-amber-100",
      badgeStyle: "bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold",
      trend: `${metrics.critical} Critical`,
      highlight: (metrics.expiringSoon + metrics.critical) > 0,
    },
    {
      title: "Expired Iqamas",
      value: metrics.expired,
      desc: "Overdue penalties apply",
      icon: AlertCircle,
      accentGradient: "from-rose-500 to-red-600",
      bgIcon: "bg-rose-50 text-rose-600 border border-rose-100",
      badgeStyle: metrics.expired > 0 ? "bg-rose-50 text-rose-700 border border-rose-200/70 font-bold" : "bg-slate-50 text-slate-600 border border-slate-200/60",
      trend: metrics.expired > 0 ? "Action Required" : "Zero Expired",
      highlight: metrics.expired > 0,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Executive Iqama Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time Saudi labor compliance, Muqeem expiry monitoring, and employee record tracking.
            </p>
          </div>
        </div>

        {/* 4 Modern Redesigned Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 relative overflow-hidden group"
              >
                {/* Subtle Top Gradient Accent Bar */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.accentGradient}`} />

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
                      {card.value}
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.bgIcon} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400 font-medium truncate">{card.desc}</span>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] ${card.badgeStyle}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redesigned Urgent Action Banner (Stripe/Linear Style) */}
        {(metrics.expired > 0 || metrics.expiresToday > 0 || metrics.critical > 0) && (
          <div className="bg-gradient-to-r from-rose-50/90 via-white to-amber-50/60 rounded-2xl p-4 sm:p-5 border border-rose-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/80 shadow-xs">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Attention Required: {metrics.expired} Expired &bull; {metrics.expiresToday} Expiring Today &bull; {metrics.critical} Critical (≤7 Days)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ministry of Interior (Jawazat) penalties start at SAR 500 per month for delayed renewals.
                </p>
              </div>
            </div>
            <Link
              href="/employees?expiryStatus=CRITICAL"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Resolve Critical Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Dashboard Charts: Grid of 2 with Modern Softer Curves & Custom Tooltips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Expiry Status Breakdown (Donut) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Iqama Expiry Distribution</h3>
                <p className="text-xs text-slate-500">Breakdown of active residence permits by urgency</p>
              </div>
            </div>
            {(!data?.statusDistribution || data.statusDistribution.length === 0 || metrics.totalEmployees === 0) ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No active Iqama records</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Register employees or import your roster to see live status breakdown.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="value"
                    >
                      {(data?.statusDistribution || []).map((entry: any, index: number) => {
                        let fill = entry.color;
                        if (entry.name?.includes("Valid")) fill = "#10B981";
                        else if (entry.name?.includes("Expiring Soon")) fill = "#F59E0B";
                        else if (entry.name?.includes("Critical")) fill = "#F97316";
                        else if (entry.name?.includes("Expired")) fill = "#F43F5E";
                        return <Cell key={`cell-${index}`} fill={fill} stroke="transparent" />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Monthly Expiry Forecast (Bar Chart with Soft Curves) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Monthly Expiry Forecast (Next 6 Months)</h3>
                <p className="text-xs text-slate-500">Upcoming renewals timeline and workload</p>
              </div>
            </div>
            {(!data?.trendData || data.trendData.length === 0 || metrics.totalEmployees === 0) ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No upcoming renewals</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Forecast timeline will update automatically as Iqama records are added.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.trendData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#E2E8F0" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} stroke="#E2E8F0" />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="valid" name="Valid" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expiring" name="Expiring Soon" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expired" name="Expired" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
