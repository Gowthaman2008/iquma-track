"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { RenewModal } from "@/components/modals/RenewModal";
import Link from "next/link";
import {
  RefreshCw,
  Search,
  DollarSign,
  Calendar,
  UserCheck,
  FileText,
  Building,
  ArrowRight,
} from "lucide-react";

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/renewals");
      if (res.ok) {
        const data = await res.json();
        setRenewals(data.renewals || []);
        setTotalCost(data.totalCost || 0);
        setTotalCount(data.totalCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const filtered = renewals.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.employee?.fullName?.toLowerCase().includes(s) ||
      r.employee?.employeeId?.toLowerCase().includes(s) ||
      r.employee?.iqamaNumberMasked?.includes(s) ||
      r.updatedByName?.toLowerCase().includes(s) ||
      r.notes?.toLowerCase().includes(s)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-[#006C35]" />
              <span>Iqama Renewal Management & History</span>
            </h1>
            <p className="text-xs text-[#6B7C72] mt-0.5">
              Comprehensive ledger of residence permit renewals, Qiwa / Muqeem fees, and auditor logs.
            </p>
          </div>
        </div>

        {/* Financial & Volume Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E2ECE5] shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Renewals Processed
            </span>
            <div className="text-3xl font-black text-gray-900 mt-1">{totalCount}</div>
            <p className="text-[11px] text-[#006C35] font-semibold mt-2">Historical audit logged</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E2ECE5] shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Cumulative Renewal Cost
            </span>
            <div className="text-3xl font-black text-emerald-800 mt-1 font-mono">
              SAR {totalCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">Work permit + Iqama levy</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E2ECE5] shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Average Processing Fee
            </span>
            <div className="text-3xl font-black text-gray-900 mt-1 font-mono">
              SAR {totalCount > 0 ? Math.round(totalCost / totalCount).toLocaleString() : "9,650"}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">Standard Saudi expatriate tier</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2ECE5] shadow-xs">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#006C35] focus:outline-none"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-[#E2ECE5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] border-b border-[#E2ECE5] text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Previous Expiry</th>
                  <th className="py-3 px-4">New Expiry</th>
                  <th className="py-3 px-4">Renewal Date</th>
                  <th className="py-3 px-4">Cost (SAR)</th>
                  <th className="py-3 px-4">Processed By</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Loading renewal ledger...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No renewal history entries found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F9FCFA] transition">
                      <td className="py-3 px-4">
                        <Link
                          href={`/employees/${r.employee?.id}`}
                          className="font-bold text-gray-900 hover:text-[#006C35]"
                        >
                          {r.employee?.fullName}
                        </Link>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {r.employee?.employeeId} &bull; {r.employee?.iqamaNumberMasked}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-500 line-through">
                        {new Date(r.previousExpiryDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {new Date(r.newExpiryDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-gray-700">
                        {new Date(r.renewalDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {r.cost ? `SAR ${r.cost.toLocaleString()}` : "SAR 9,650"}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {r.updatedByName || r.updatedByUser?.name || "HR Officer"}
                      </td>

                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate" title={r.notes}>
                        {r.notes || "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/employees/${r.employee?.id}`}
                          className="text-[#006C35] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
    </AppLayout>
  );
}
