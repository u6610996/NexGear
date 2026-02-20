"use client";
import { useEffect, useState } from "react";
import { Plus, Minus, Users, CheckCircle, Pencil, Trash2, X, ShoppingBag } from "lucide-react";

const CATEGORIES = ["All", "Mouse", "Keyboard", "Headset", "Controller", "Monitor", "Accessories"];

export default function CustomersPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Walk-in order form
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [catFilter, setCatFilter] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Customer management
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoadingProducts(false);
  };

  const fetchCustomers = async () => {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
  };

  // Cart helpers
  const addToCart = (p) =>
    setCart((prev) => ({ ...prev, [p._id]: (prev[p._id] || 0) + 1 }));

  const changeQty = (id, delta) =>
    setCart((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });

  const cartItems = products
    .filter((p) => cart[p._id])
    .map((p) => ({ ...p, quantity: cart[p._id] }));

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const filteredProducts =
    catFilter === "All" ? products : products.filter((p) => p.category === catFilter);

  // Confirm order
  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Please enter customer name"); return; }
    if (cartItems.length === 0) { setError("Please select at least one product"); return; }
    setSubmitting(true);
    setError("");
    try {
      // Create customer
      const cRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, address: form.address }),
      });
      const customer = await cRes.json();
      if (!cRes.ok) throw new Error(customer.error || "Failed to create customer");

      // Create order
      const oRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer._id,
          customerName: customer.name,
          items: cartItems.map((i) => ({
            productId: i._id,
            productName: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount: total,
          status: "pending",
        }),
      });
      if (!oRes.ok) throw new Error("Failed to create order");

      setForm({ name: "", phone: "", address: "" });
      setCart({});
      setSuccess(true);
      fetchCustomers();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit customer
  const openEdit = (c) => {
    setEditTarget(c._id);
    setEditForm({ name: c.name, phone: c.phone || "", address: c.address || "" });
    setEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await fetch(`/api/customers/${editTarget}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditModal(false);
      fetchCustomers();
    } catch {
      alert("Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer record?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  };

  return (
    <div className="py-8 space-y-8">

      {/* ── Walk-in Order Form ── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2 mb-1">
          <ShoppingBag className="w-6 h-6 text-neon-green" /> WALK-IN ORDER
        </h1>
        <p className="text-slate-400 text-sm mb-6">Fill in customer info and select products</p>

        {success && (
          <div className="flex items-center gap-2 mb-5 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg text-neon-green">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Order confirmed! Check the Orders page.</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleConfirm}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Customer Info + Product Catalog */}
            <div className="lg:col-span-2 space-y-5">

              {/* Customer Info */}
              <div className="bg-dark-800 border border-white/5 rounded-lg p-5">
                <h2 className="text-white font-semibold text-sm tracking-wider mb-4">Customer Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                      placeholder="08x-xxx-xxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Address</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                      placeholder="Bangkok..."
                    />
                  </div>
                </div>
              </div>

              {/* Product Catalog */}
              <div className="bg-dark-800 border border-white/5 rounded-lg p-5">
                <h2 className="text-white font-semibold text-sm tracking-wider mb-4">Select Products</h2>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatFilter(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        catFilter === c
                          ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Product Grid */}
                {loadingProducts ? (
                  <p className="text-slate-500 text-sm text-center py-8">Loading...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No products in this category</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredProducts.map((p) => {
                      const inCart = cart[p._id] || 0;
                      const outOfStock = p.stock === 0;
                      return (
                        <div
                          key={p._id}
                          className={`bg-dark-900 border rounded-lg p-3 transition-colors ${
                            inCart > 0
                              ? "border-neon-green/40 bg-neon-green/5"
                              : "border-white/5"
                          } ${outOfStock ? "opacity-40" : ""}`}
                        >
                          <span className="text-xs text-slate-500 block mb-1">{p.category}</span>
                          <p className="text-white text-sm font-medium leading-tight mb-1">{p.name}</p>
                          <p className="text-neon-cyan text-sm font-semibold mb-2">
                            ฿{p.price.toLocaleString()}
                          </p>
                          <p className={`text-xs mb-3 ${p.stock < 5 ? "text-red-400" : "text-slate-500"}`}>
                            Stock: {p.stock}
                          </p>

                          {inCart === 0 ? (
                            <button
                              type="button"
                              disabled={outOfStock}
                              onClick={() => addToCart(p)}
                              className="w-full flex items-center justify-center gap-1 py-1.5 bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs rounded hover:bg-neon-green/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          ) : (
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => changeQty(p._id, -1)}
                                className="w-7 h-7 flex items-center justify-center bg-dark-800 border border-white/10 rounded text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-white text-sm font-bold">{inCart}</span>
                              <button
                                type="button"
                                onClick={() => changeQty(p._id, 1)}
                                className="w-7 h-7 flex items-center justify-center bg-dark-800 border border-white/10 rounded text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Cart + Confirm */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800 border border-white/5 rounded-lg p-5 sticky top-20">
                <h2 className="text-white font-semibold text-sm tracking-wider mb-4 flex items-center justify-between">
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-full">
                      {cartCount} items
                    </span>
                  )}
                </h2>

                {cartItems.length === 0 ? (
                  <p className="text-slate-600 text-sm text-center py-8">No items selected</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{item.name}</p>
                          <p className="text-slate-500 text-xs">฿{item.price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <p className="text-neon-cyan text-sm font-semibold shrink-0">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {cartItems.length > 0 && (
                  <div className="border-t border-white/10 pt-3 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Total</span>
                      <span className="text-white font-bold text-xl">฿{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0 || !form.name}
                  className="w-full py-3 bg-neon-green/15 border border-neon-green/40 text-neon-green font-semibold rounded-lg hover:bg-neon-green/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-wider"
                >
                  {submitting ? "Saving..." : "✓ Confirm Order"}
                </button>
                <p className="text-slate-600 text-xs text-center mt-2">Cannot be cancelled after confirmation</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Customer List ── */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-wider flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-400" /> Customer List
          <span className="text-slate-500 text-sm font-normal">({customers.length} total)</span>
        </h2>

        <div className="bg-dark-800 border border-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">Phone</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">Address</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-center text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-10">
                      No customers yet
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c._id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3 text-white font-medium">{c.name}</td>
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
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-dark-700 border border-white/10 rounded-lg w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold tracking-wider">Edit Customer</h2>
              <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Name *</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Address</label>
                <input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-green/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="flex-1 px-4 py-2 border border-white/10 text-slate-400 rounded hover:bg-white/5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 px-4 py-2 bg-neon-green/10 border border-neon-green/30 text-neon-green rounded text-sm disabled:opacity-50"
                >
                  {editSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
