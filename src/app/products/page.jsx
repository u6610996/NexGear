"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";

const CATEGORIES = ["Mouse", "Keyboard", "Headset", "Controller", "Monitor", "Accessories"];

const emptyForm = { name: "", brand: "", category: "Mouse", price: "", stock: "", description: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    });
    setError("");
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/products/${editing}` : "/api/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      setModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Package className="w-6 h-6 text-neon-cyan" /> PRODUCTS
          </h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} items in catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded hover:bg-neon-cyan/20 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Brand</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Category</th>
                <th className="px-4 py-3 text-right text-slate-400 font-medium">Price (฿)</th>
                <th className="px-4 py-3 text-right text-slate-400 font-medium">Stock</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-12">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-12">
                    No products yet. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-slate-300">{p.brand}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {Number(p.price).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${p.stock < 5 ? "text-red-400" : "text-neon-green"}`}>
                      {p.stock}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
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
                {editing ? "EDIT PRODUCT" : "ADD PRODUCT"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan/50"
                    placeholder="Razer DeathAdder"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Brand *</label>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan/50"
                    placeholder="Razer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan/50"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Price (฿) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan/50"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Stock *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan/50"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan/50 resize-none"
                  placeholder="Optional description..."
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
                  className="flex-1 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded hover:bg-neon-cyan/20 text-sm font-medium transition-colors disabled:opacity-50"
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
