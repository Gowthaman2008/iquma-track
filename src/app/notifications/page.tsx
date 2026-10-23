"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Mail,
  Send,
  ExternalLink,
  Filter,
} from "lucide-react";

export default function NotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "EXPIRING_SOON" | "EXPIRED">("ALL");
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRunCheck = async () => {
    setTriggering(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cron/expiry-check", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setMessage(json.message);
        fetchNotifications();
      } else {
        setMessage(json.error || "Execution failed");
      }
    } catch (e: any) {
      setMessage(`Failed: ${e.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const handleSendReminder = async (empId: string) => {
    try {
      const res = await fetch(`/api/employees/${empId}/remind`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setMessage(`Reminder dispatched successfully.`);
        fetchNotifications();
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const alerts = data?.alerts || [];
  const filteredAlerts = alerts.filter((a: any) => {
    if (filter === "ALL") return true;
    if (filter === "CRITICAL") return a.status === "CRITICAL" || a.status === "EXPIRES_TODAY";
    if (filter === "EXPIRING_SOON") return a.status === "EXPIRING_SOON";
    if (filter === "EXPIRED") return a.status === "EXPIRED";
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#006C35]" />
              <span>Notification & Regulatory Alert Center</span>
            </h1>
            <p className="text-xs text-[#6B7C72] mt-0.5">
              Live monitoring of upcoming expiry deadlines, automated dispatch schedules, and email logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCheck}
              disabled={triggering}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${triggering ? "animate-spin" : ""}`} />
              <span>{triggering ? "Scanning Engine..." : "Scan & Trigger Reminders Now"}</span>
            </button>
          </div>
        </div>

        {/* Global Message Banner */}
        {message && (
          <div className="bg-[#EFF8F3] border border-[#006C35]/30 p-3.5 rounded-xl text-xs text-[#004B28] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006C35]" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setFilter("CRITICAL")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filter === "CRITICAL"
                ? "bg-red-50 border-red-300 ring-2 ring-red-400/30"
                : "bg-white border-[#E2ECE5] hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-600 uppercase">Critical (≤7d)</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-700 mt-1">
              {data?.stats?.criticalAlerts || 0}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Imminent Jawazat deadline</p>
          </div>

          <div
            onClick={() => setFilter("EXPIRING_SOON")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filter === "EXPIRING_SOON"
                ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/30"
                : "bg-white border-[#E2ECE5] hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Expiring Soon (8-30d)</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-800 mt-1">
              {data?.stats?.expiringSoonAlerts || 0}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Renewal window active</p>
          </div>

          <div
            onClick={() => setFilter("EXPIRED")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filter === "EXPIRED"
                ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/30"
                : "bg-white border-[#E2ECE5] hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase">Expired Iqamas</span>
              <AlertCircle className="w-4 h-4 text-rose-800" />
            </div>
            <div className="text-2xl font-black text-rose-900 mt-1">
              {data?.stats?.expiredAlerts || 0}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Weekly reminders scheduled</p>
          </div>

          <div
            onClick={() => setFilter("ALL")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filter === "ALL"
                ? "bg-emerald-50 border-[#006C35] ring-2 ring-[#006C35]/30"
                : "bg-white border-[#E2ECE5] hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#006C35] uppercase">Total Action Items</span>
              <Bell className="w-4 h-4 text-[#006C35]" />
            </div>
            <div className="text-2xl font-black text-[#004B28] mt-1">
              {alerts.length}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">View all monitored alerts</p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-2xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2ECE5] flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-sm text-gray-900">
              Active Urgent Expiry Alerts ({filteredAlerts.length})
            </h3>
            <span className="text-xs text-gray-500">
              Showing: {filter}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading alerts...</div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                No active alerts in this category!
              </div>
            ) : (
              filteredAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="p-4 hover:bg-gray-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        alert.status === "EXPIRED"
                          ? "bg-red-100 text-red-700"
                          : alert.status === "CRITICAL" || alert.status === "EXPIRES_TODAY"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/employees/${alert.employeeId}`}
                          className="font-bold text-gray-900 hover:text-[#006C35] text-sm"
                        >
                          {alert.fullName}
                        </Link>
                        <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                          {alert.employeeCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Iqama: <span className="font-mono">{alert.maskedIqama}</span> &bull; Department: {alert.department}
                      </p>
                      <p className="text-[11px] font-semibold text-gray-700 mt-1">
                        Expiry Date: <span className="text-gray-900">{alert.expiryDate}</span> &bull;{" "}
                        <span
                          className={
                            alert.daysRemaining < 0
                              ? "text-red-700 font-bold"
                              : alert.daysRemaining <= 7
                              ? "text-rose-600 font-bold"
                              : "text-amber-700 font-bold"
                          }
                        >
                          {alert.daysRemaining < 0
                            ? `EXPIRED (${Math.abs(alert.daysRemaining)} days ago)`
                            : alert.daysRemaining === 0
                            ? "EXPIRES TODAY"
                            : `${alert.daysRemaining} days remaining`}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleSendReminder(alert.employeeId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Reminder</span>
                    </button>
                    <Link
                      href={`/employees/${alert.employeeId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006C35] text-white text-xs font-semibold hover:bg-[#004B28] transition"
                    >
                      <span>Resolve & Renew</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
