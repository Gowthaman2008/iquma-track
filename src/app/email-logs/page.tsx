"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { MailCheck, Search, Filter, RefreshCw, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/email-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/email-logs/${logId}/retry`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("Notification re-queued and dispatched successfully.");
        fetchLogs();
      } else {
        setActionMessage(data.error || "Retry failed.");
      }
    } catch (e: any) {
      setActionMessage(`Error: ${e.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <MailCheck className="w-6 h-6 text-[#006C35]" />
              <span>Automated Email Dispatch Logs</span>
            </h1>
            <p className="text-xs text-[#6B7C72] mt-0.5">
              Audit log of scheduled notifications, delivery receipts, duplicate prevention keys, and Resend/SMTP logs.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#E2ECE5] text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Action message */}
        {actionMessage && (
          <div className="bg-[#EFF8F3] border border-[#006C35]/30 p-3 rounded-xl text-xs text-[#004B28] flex items-center justify-between animate-in fade-in">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)}>&times;</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2ECE5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by recipient, employee, or notification key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none"
            >
              <option value="ALL">All Delivery Statuses</option>
              <option value="SENT">Delivered / Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] border-b border-[#E2ECE5] text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Milestone Type</th>
                  <th className="py-3 px-4">Recipient Email</th>
                  <th className="py-3 px-4">Dispatch Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deduplication Key</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Loading delivery logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No email delivery logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F9FCFA] transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900">{log.employee?.fullName}</span>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {log.employee?.employeeId} &bull; {log.employee?.iqamaNumberMasked}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-emerald-800">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px]">
                          {log.notificationType}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-700">
                        {log.recipient}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : "Pending"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === "SENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.status === "SENT" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>{log.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-gray-400 truncate max-w-xs" title={log.uniqueNotificationKey}>
                        {log.uniqueNotificationKey}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {log.status === "FAILED" ? (
                          <button
                            onClick={() => handleRetry(log.id)}
                            disabled={retryingId === log.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingId === log.id ? "animate-spin" : ""}`} />
                            <span>Retry</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
