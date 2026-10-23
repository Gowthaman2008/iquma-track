"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Building,
  Users,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Papa from "papaparse";

export default function ReportsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/dashboard/stats").then((r) => r.json()),
    ])
      .then(([empData, statsData]) => {
        setEmployees(empData.employees || []);
        setStats(statsData);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const data = employees.map((e) => ({
      "Employee ID": e.employeeId,
      "Full Name": e.fullName,
      "Iqama Number (Masked)": e.iqamaNumberMasked,
      "Expiry Date": e.evaluation.formattedDate,
      "Days Remaining": e.evaluation.daysRemaining,
      "Status": e.evaluation.status,
      "Department": e.department,
      "Job Position": e.jobPosition,
      "Email": e.email,
      "Mobile": e.mobileNumber,
      "Nationality": e.nationality,
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Saudi_Iqama_Regulatory_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header (hidden in print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <FileBarChart2 className="w-6 h-6 text-[#006C35]" />
              <span>Saudi Iqama Compliance & Expiry Reports</span>
            </h1>
            <p className="text-xs text-[#6B7C72] mt-0.5">
              Official audit documentation ready for executive review, HR planning, and Jawazat audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E2ECE5] text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#006C35]" />
              <span>Export Full CSV</span>
            </button>
          </div>
        </div>

        {/* Printable Official Report Document Container */}
        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs p-6 md:p-10 space-y-8">
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#006C35] pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#004B28]">IqamaTrack</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#004B28]">
                  OFFICIAL AUDIT REPORT
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Saudi Expatriate Residence Permit Expiry Audit</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p className="font-semibold text-gray-800">Generated: {new Date().toLocaleDateString("en-GB")}</p>
              <p>Riyadh (KSA) Standard Time</p>
              <p>Kingdom of Saudi Arabia</p>
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Executive Summary Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Workers</span>
                <div className="text-2xl font-black text-gray-900 mt-0.5">
                  {stats?.metrics?.totalEmployees || employees.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-[#004B28] uppercase font-semibold">Active & Valid</span>
                <div className="text-2xl font-black text-[#006C35] mt-0.5">
                  {(stats?.metrics?.totalEmployees || 0) - ((stats?.metrics?.expiringSoon || 0) + (stats?.metrics?.critical || 0) + (stats?.metrics?.expired || 0))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 uppercase font-semibold">Expiring ≤30 Days</span>
                <div className="text-2xl font-black text-amber-700 mt-0.5">
                  {(stats?.metrics?.expiringSoon || 0) + (stats?.metrics?.critical || 0)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <span className="text-[10px] text-red-800 uppercase font-semibold">Expired / Overdue</span>
                <div className="text-2xl font-black text-red-700 mt-0.5">
                  {stats?.metrics?.expired || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Comprehensive Employee Expiry Schedule
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Emp ID</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Masked Iqama</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Timeline</th>
                    <th className="py-2.5 px-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50">
                      <td className="py-2 px-3 font-mono font-semibold text-gray-700">
                        {emp.employeeId}
                      </td>
                      <td className="py-2 px-3 font-bold text-gray-900">
                        {emp.fullName}
                      </td>
                      <td className="py-2 px-3 font-mono text-gray-800">
                        {emp.iqamaNumberMasked}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {emp.department}
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-800">
                        {emp.evaluation.formattedDate}
                      </td>
                      <td className="py-2 px-3 font-semibold">
                        {emp.evaluation.daysRemaining < 0
                          ? `${Math.abs(emp.evaluation.daysRemaining)}d overdue`
                          : emp.evaluation.daysRemaining === 0
                          ? "Expires Today"
                          : `${emp.evaluation.daysRemaining} days left`}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge
                          status={emp.evaluation.status}
                          daysRemaining={emp.evaluation.daysRemaining}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory Disclaimer & Signatures */}
          <div className="pt-6 border-t border-gray-200 text-[11px] text-gray-500 space-y-4">
            <p>
              <strong>Regulatory Certification:</strong> This report is generated by IqamaTrack Automated Expiry System.
              Dates are calculated against the Asia/Riyadh timezone standard in accordance with Saudi Labor Law, Qiwa electronic contract protocols, and the General Directorate of Passports (Jawazat).
            </p>

            <div className="grid grid-cols-2 gap-8 pt-8 text-center">
              <div className="border-t border-dashed border-gray-300 pt-2">
                <p className="font-bold text-gray-800">Prepared by: HR Manager / GRO</p>
                <p className="text-[10px] text-gray-400">Signature & Corporate Seal</p>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-2">
                <p className="font-bold text-gray-800">Approved by: Managing Director / Super Admin</p>
                <p className="text-[10px] text-gray-400">Signature & Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
