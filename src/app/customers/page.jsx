"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Users } from "lucide-react";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };

  const openEdit = (customer) => {
    setEditing(customer._id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setError("");
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/customers/${editing}` : "/api/customers";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      setModal(false);
      fetchCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      fetchCustomers();
    } catch {
      alert("Failed to delete customer");
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Users className="w-6 h-6 text-neon-green" /> CUSTOMERS
          </h1>
          <p className="text-slate-400 text-sm mt-1">{customers.length} registered customers</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 text-neon-green rounded hover:bg-neon-green/20 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Email</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Phone</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Address</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Joined</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-12">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-12">
                    No customers yet. Add your first customer!
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-slate-300">{c.email}</td>
                    <td className="px-4 py-3 text-slate-400">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{c.address || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-neon-green hover:bg-neon-green/10 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-dark-700 border border-white/10 rounded-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold tracking-wider">
                {editing ? "EDIT CUSTOMER" : "ADD CUSTOMER"}
              </h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                  placeholder="08x-xxx-xxxx"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50 resize-none"
                  placeholder="123 Main St, Bangkok..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 px-4 py-2 border border-white/10 text-slate-400 rounded hover:bg-white/5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-neon-green/10 border border-neon-green/30 text-neon-green rounded hover:bg-neon-green/20 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
