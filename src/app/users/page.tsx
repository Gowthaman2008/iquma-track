"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  ShieldCheck,
  UserPlus,
  Shield,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  User,
  KeyRound,
  Info,
} from "lucide-react";

export default function AdminManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR_MANAGER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "HR_MANAGER" });
    setModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, password: "", role: u.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Operation failed");
      }

      setMessage({ type: "success", text: data.message });
      setModalOpen(false);
      fetchUsers();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke dashboard access for administrator "${userName}"?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        fetchUsers();
        setTimeout(() => setMessage(null), 4000);
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                Dashboard Access Control
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>Admin Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorize and manage administrator accounts permitted to access the Iqama Track management console.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs hover:shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Admin</span>
          </button>
        </div>

        {/* Security Notice Banner */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Restricted Console Access:</span> Only administrators registered in this section are authorized to sign in and monitor employee records, Iqama expiry dates, and renewal operations.
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75 font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Admin Accounts Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Email / Sign-In ID</th>
                  <th className="py-3 px-4">Admin Role</th>
                  <th className="py-3 px-4">Entity Access</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading administrator accounts...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No admin accounts found. Click "Add New Admin" to authorize an administrator.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{u.name}</span>
                            <div className="text-[10px] text-slate-400">ID: {u.id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{u.role === "SUPER_ADMIN" ? "Super Admin" : "HR Manager / Admin"}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {u.company?.companyName || "AL Houf Trading & Contracting Group"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                          title="Edit Admin"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                          title="Revoke Admin Access"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {editingUser ? "Edit Admin Account" : "Add New Administrator"}
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Grant manual access to the Iqama Track dashboard
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-emerald-100 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Al-Mansoor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Sign-In Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  placeholder="admin@alhouf.sa"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 disabled:bg-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">This email will be used to log in at the admin portal.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingUser ? "New Password (Leave blank to keep unchanged)" : "Admin Password *"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? "••••••••" : "At least 6 characters"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Privilege Level *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="SUPER_ADMIN">Super Admin (Full System & Access Control)</option>
                  <option value="HR_MANAGER">HR Admin / Manager (Iqama Expiry & Renewals)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Controls permissions across the Iqama tracking console.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                >
                  {editingUser ? "Save Admin Changes" : "Grant Dashboard Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
