"use client";

import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RenewModal } from "@/components/modals/RenewModal";
import { UploadDocModal } from "@/components/modals/UploadDocModal";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  RefreshCw,
  Mail,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckSquare,
  Square,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import Papa from "papaparse";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [expiryFilter, setExpiryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [renewTarget, setRenewTarget] = useState<{ id: string; name: string; expiry: string } | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ id: string; name: string } | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (departmentFilter !== "ALL") params.append("department", departmentFilter);
      if (expiryFilter !== "ALL") params.append("expiryStatus", expiryFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/employees?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter, expiryFilter, statusFilter]);

  // Handle live search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Departments list from employees
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Toggle selection
  const handleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((e) => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk email reminders
  const handleBulkRemind = async () => {
    if (selectedIds.length === 0) return;
    setActionMessage({ type: "success", text: `Sending reminders to ${selectedIds.length} employees...` });

    let sent = 0;
    for (const id of selectedIds) {
      try {
        await fetch(`/api/employees/${id}/remind`, { method: "POST" });
        sent++;
      } catch (e) {
        console.error(e);
      }
    }

    setActionMessage({ type: "success", text: `Successfully triggered reminders for ${sent} employees.` });
    setSelectedIds([]);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const exportData = employees.map((e) => ({
      "Employee ID": e.employeeId,
      "Full Name": e.fullName,
      "Iqama Number (Masked)": e.iqamaNumberMasked,
      "Expiry Date": e.evaluation.formattedDate,
      "Days Remaining": e.evaluation.daysRemaining,
      "Expiry Status": e.evaluation.status,
      "Department": e.department,
      "Job Position": e.jobPosition,
      "Email": e.email,
      "Mobile": e.mobileNumber,
      "Nationality": e.nationality,
      "Status": e.status,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IqamaTrack_Employees_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete employee
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete employee "${name}"? This action is permanent.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage({ type: "success", text: `Employee "${name}" deleted.` });
        fetchEmployees();
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send single reminder
  const handleSendReminder = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/employees/${id}/remind`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: "success",
          text: `Reminder sent to ${name}. ${data.duplicate ? "(Duplicate alert skipped)" : ""}`,
        });
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to send email." });
      }
    } catch (e) {
      setActionMessage({ type: "error", text: "Network error sending reminder." });
    }
  };

  // CSV Import execution
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await fetch("/api/employees/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: data.message });
        setImportModalOpen(false);
        setImportFile(null);
        fetchEmployees();
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        alert(data.error || "Import failed");
      }
    } catch (err: any) {
      alert("Error uploading CSV: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Pagination slice
  const totalPages = Math.ceil(employees.length / pageSize) || 1;
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Employee Directory & Iqama Records
            </h1>
            <p className="text-xs text-[#6B7C72] mt-0.5">
              Manage workforce identity, residence permits, renewals, and regulatory compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E2ECE5] text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#006C35]" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E2ECE5] text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#006C35]" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/employees/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-md shadow-[#006C35]/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </Link>
          </div>
        </div>

        {/* Global Action Banner */}
        {actionMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
              actionMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)}>
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2ECE5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or Iqama number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006C35]"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Expiry Status Filter */}
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006C35]"
            >
              <option value="ALL">All Expiry Statuses</option>
              <option value="VALID">Valid (&gt;30d)</option>
              <option value="EXPIRING_SOON">Expiring Soon (8-30d)</option>
              <option value="CRITICAL">Critical (1-7d)</option>
              <option value="EXPIRES_TODAY">Expires Today</option>
              <option value="EXPIRED">Expired</option>
            </select>

            {/* Employee Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006C35]"
            >
              <option value="ALL">All Records</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="VACATION">Vacation</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when records are selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-[#EFF8F3] border border-[#006C35]/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#004B28] animate-in fade-in">
            <span className="font-bold">
              {selectedIds.length} employee{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkRemind}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006C35] text-white font-semibold hover:bg-[#004B28] transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Bulk Expiry Reminders</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Professional Table */}
        <div className="bg-white rounded-2xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] border-b border-[#E2ECE5] text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="p-0.5 text-gray-500 hover:text-gray-800">
                      {selectedIds.length === employees.length && employees.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#006C35]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Iqama Number</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Loading employee directory...
                    </td>
                  </tr>
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No employees match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => {
                    const isSelected = selectedIds.includes(emp.id);
                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-[#F9FCFA] transition ${
                          isSelected ? "bg-[#EFF8F3]/60" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleSelect(emp.id)}
                            className="p-0.5 text-gray-500 hover:text-gray-800"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#006C35]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <Link
                            href={`/employees/${emp.id}`}
                            className="font-bold text-gray-900 hover:text-[#006C35] transition"
                          >
                            {emp.fullName}
                          </Link>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono bg-gray-100 px-1.5 py-0.2 rounded font-semibold text-gray-700">
                              {emp.employeeId}
                            </span>
                            <span>&bull;</span>
                            <span>{emp.nationality}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-gray-800">
                          {emp.iqamaNumberMasked}
                        </td>

                        <td className="py-3 px-4 font-medium text-gray-800">
                          {emp.evaluation.formattedDate}
                        </td>

                        <td className="py-3 px-4 font-bold">
                          <span
                            className={
                              emp.evaluation.daysRemaining < 0
                                ? "text-red-700"
                                : emp.evaluation.daysRemaining <= 7
                                ? "text-rose-600"
                                : emp.evaluation.daysRemaining <= 30
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }
                          >
                            {emp.evaluation.daysRemaining < 0
                              ? `${Math.abs(emp.evaluation.daysRemaining)}d overdue`
                              : emp.evaluation.daysRemaining === 0
                              ? "Today!"
                              : `${emp.evaluation.daysRemaining} days`}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-gray-700">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] font-medium">
                            {emp.department}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge
                            status={emp.evaluation.status}
                            daysRemaining={emp.evaluation.daysRemaining}
                          />
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Renew Modal Trigger */}
                            <button
                              onClick={() =>
                                setRenewTarget({
                                  id: emp.id,
                                  name: emp.fullName,
                                  expiry: emp.evaluation.formattedDate,
                                })
                              }
                              title="Renew Iqama"
                              className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Upload Document Trigger */}
                            <button
                              onClick={() =>
                                setUploadTarget({
                                  id: emp.id,
                                  name: emp.fullName,
                                })
                              }
                              title="Upload Iqama Document"
                              className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>

                            {/* Send Manual Reminder Email */}
                            <button
                              onClick={() => handleSendReminder(emp.id, emp.fullName)}
                              title="Send Reminder Email"
                              className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            {/* View Profile */}
                            <Link
                              href={`/employees/${emp.id}`}
                              title="View Profile"
                              className="p-1.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/employees/${emp.id}/edit`}
                              title="Edit Details"
                              className="p-1.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(emp.id, emp.fullName)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-[#E2ECE5] flex items-center justify-between text-xs text-gray-600">
            <span>
              Showing {employees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, employees.length)} of {employees.length} employees
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-semibold text-gray-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
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
          onSuccess={fetchEmployees}
        />
      )}

      {/* Upload Document Modal */}
      {uploadTarget && (
        <UploadDocModal
          isOpen={true}
          onClose={() => setUploadTarget(null)}
          employeeId={uploadTarget.id}
          employeeName={uploadTarget.name}
          onSuccess={fetchEmployees}
        />
      )}

      {/* CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Bulk Import Employees (CSV)</h3>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="p-1 rounded-md text-emerald-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              <p className="text-xs text-gray-600">
                Upload a CSV file containing: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">Full Name, Employee ID, Iqama Number, Expiry Date, Email, Department, Nationality</code>.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#006C35] transition cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files && setImportFile(e.target.files[0])}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer">
                  <FileText className="w-8 h-8 mx-auto text-[#006C35] mb-2" />
                  <p className="text-xs font-semibold text-gray-700">
                    {importFile ? importFile.name : "Select CSV file"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Comma-separated values</p>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#006C35] text-white hover:bg-[#004B28] transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>{importing ? "Importing..." : "Upload & Parse"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
