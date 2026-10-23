"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Building,
  Briefcase,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function EditEmployeeContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    iqamaNumber: "",
    iqamaIssueDate: "",
    iqamaExpiryDate: "",
    dob: "",
    nationality: "Saudi Arabia",
    gender: "Male",
    department: "Engineering",
    jobPosition: "",
    mobileNumber: "",
    email: "",
    passportNumber: "",
    passportExpiryDate: "",
    status: "ACTIVE",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.employee) {
          const emp = data.employee;
          setFormData({
            fullName: emp.fullName || "",
            employeeId: emp.employeeId || "",
            iqamaNumber: emp.plainIqamaNumber || emp.iqamaNumberMasked || "",
            iqamaIssueDate: emp.iqamaIssueDate ? emp.iqamaIssueDate.split("T")[0] : "",
            iqamaExpiryDate: emp.iqamaExpiryDate ? emp.iqamaExpiryDate.split("T")[0] : "",
            dob: emp.dob ? emp.dob.split("T")[0] : "",
            nationality: emp.nationality || "Saudi Arabia",
            gender: emp.gender || "Male",
            department: emp.department || "Engineering",
            jobPosition: emp.jobPosition || "",
            mobileNumber: emp.mobileNumber || "",
            email: emp.email || "",
            passportNumber: emp.passportNumber || "",
            passportExpiryDate: emp.passportExpiryDate ? emp.passportExpiryDate.split("T")[0] : "",
            status: emp.status || "ACTIVE",
            notes: emp.notes || "",
          });
        }
      })
      .catch((e) => setError("Failed to load employee."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update employee.");
      }

      router.push(`/employees/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const nationalities = [
    "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Bangladesh",
    "Jordan", "Lebanon", "Sudan", "Yemen", "Syria", "United Kingdom",
    "United States", "Canada", "Singapore", "Other"
  ];

  const departments = [
    "Engineering", "Information Technology", "Human Resources", "Finance & Accounts",
    "Operations", "Logistics & Supply", "Sales & Marketing", "Legal & Compliance",
    "Executive Management"
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-12 text-center text-gray-500 animate-pulse">
          Loading employee details for editing...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/employees/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#006C35] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and Return to Profile</span>
          </Link>
          <span className="text-xs text-gray-400">Editing: {formData.employeeId}</span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] p-6 text-white flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-300" />
                <span>Edit Employee: {formData.fullName}</span>
              </h1>
              <p className="text-xs text-emerald-100 mt-1">
                Update residence permit details, department assignment, or contact channels.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
                1. Personal & Company Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Employee Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    disabled
                    name="employeeId"
                    value={formData.employeeId}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-mono text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nationality
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    {nationalities.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    <option value="ACTIVE">Active (Working)</option>
                    <option value="VACATION">Annual Vacation</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#EFF8F3] p-5 rounded-2xl border border-[#D0E5D8]">
              <h3 className="text-xs font-bold text-[#004B28] uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#006C35]" />
                <span>2. Saudi Arabian Iqama Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#004B28] mb-1">
                    Iqama Number (10 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    name="iqamaNumber"
                    value={formData.iqamaNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#006C35]/30 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#004B28] mb-1">
                    Iqama Issue Date
                  </label>
                  <input
                    type="date"
                    name="iqamaIssueDate"
                    value={formData.iqamaIssueDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#006C35]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#004B28] mb-1">
                    Iqama Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    name="iqamaExpiryDate"
                    value={formData.iqamaExpiryDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-red-300 rounded-xl text-sm font-bold text-red-900 focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
                3. Job & Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Title / Position *
                  </label>
                  <input
                    type="text"
                    required
                    name="jobPosition"
                    value={formData.jobPosition}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Saudi Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Internal Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link
                href={`/employees/${id}`}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-md shadow-[#006C35]/20 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Update Employee"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default function EditEmployeePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-xs">
          Loading edit form...
        </div>
      }
    >
      <EditEmployeeContent />
    </React.Suspense>
  );
}

