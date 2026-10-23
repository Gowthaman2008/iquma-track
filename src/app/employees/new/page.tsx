"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
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

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    iqamaNumber: "",
    iqamaIssueDate: new Date().toISOString().split("T")[0],
    iqamaExpiryDate: "",
    dob: "",
    nationality: "Saudi Arabia",
    gender: "Male",
    department: "Engineering",
    jobPosition: "",
    mobileNumber: "+966 5",
    email: "",
    passportNumber: "",
    passportExpiryDate: "",
    status: "ACTIVE",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate 10-digit Saudi Iqama / National ID
    const cleanIqama = formData.iqamaNumber.trim();
    if (cleanIqama.length !== 10 || !/^\d+$/.test(cleanIqama)) {
      setError("Saudi Iqama/ID number must be exactly 10 numeric digits.");
      setLoading(false);
      return;
    }

    if (!formData.iqamaExpiryDate) {
      setError("Please select the Iqama expiry date.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create employee.");
      }

      router.push(`/employees/${data.employee.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#006C35] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employee List</span>
          </Link>
          <span className="text-xs text-gray-400">Step 1 of 1 &bull; Regulatory Onboarding</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#004B28] to-[#006C35] p-6 text-white flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-300" />
                <span>Add Employee & Iqama Record</span>
              </h1>
              <p className="text-xs text-emerald-100 mt-1">
                Records are securely encrypted and automatically registered with the expiry tracking engine.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Basic Identity */}
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
                    placeholder="e.g. Tariq Mansour Al-Harbi"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Employee ID / Badge *
                  </label>
                  <input
                    type="text"
                    required
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nationality *
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
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Employee Status *
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

            {/* Section 2: Saudi Iqama Residence Permit (Core Engine Fields) */}
            <div className="bg-[#EFF8F3] p-5 rounded-2xl border border-[#D0E5D8]">
              <h3 className="text-xs font-bold text-[#004B28] uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#006C35]" />
                <span>2. Saudi Arabian Iqama Details (Encrypted Storage)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#004B28] mb-1">
                    Saudi Iqama Number (10 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    name="iqamaNumber"
                    placeholder="e.g. 2451928304"
                    value={formData.iqamaNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#006C35]/30 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Starting with 2 (resident) or 1 (citizen).</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#004B28] mb-1">
                    Iqama Issue Date *
                  </label>
                  <input
                    type="date"
                    required
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
                  <p className="text-[10px] text-gray-500 mt-1">Checked daily against Riyadh timezone.</p>
                </div>
              </div>
            </div>

            {/* Section 3: Professional & Contact Info */}
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
                    placeholder="e.g. Senior Structural Engineer"
                    value={formData.jobPosition}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Corporate / Personal Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    placeholder="e.g. ahmed@company.sa"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Automated expiry reminder emails are sent here.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Saudi Mobile Number (+966)
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="+966 50 123 4567"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Passport Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    placeholder="e.g. PK982310"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Passport Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="passportExpiryDate"
                    value={formData.passportExpiryDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Internal HR / Qiwa / Muqeem Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Add any specific notes regarding Qiwa contract renewal, medical insurance policy, or special visa requirements..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link
                href="/employees"
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#006C35] text-white hover:bg-[#004B28] transition shadow-md shadow-[#006C35]/20 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? "Registering..." : "Save Employee Record"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
