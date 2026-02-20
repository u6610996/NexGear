"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, X, ShoppingCart, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];

const statusColor = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  completed: "text-neon-green bg-neon-green/10 border-neon-green/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // New order form state
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [orderNote, setOrderNote] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [oRes, cRes, pRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/customers"),
        fetch("/api/products"),
      ]);
      const [o, c, p] = await Promise.all([oRes.json(), cRes.json(), pRes.json()]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setSelectedCustomer("");
    setOrderItems([]);
    setOrderNote("");
    setError("");
    setModal(true);
  };

  const addItem = () => {
    if (products.length === 0) return;
    const p = products[0];
    setOrderItems([...orderItems, { productId: p._id, productName: p.name, price: p.price, quantity: 1 }]);
  };

  const updateItem = (idx, field, value) => {
    const updated = [...orderItems];
    if (field === "productId") {
      const p = products.find((x) => x._id === value);
      if (p) {
        updated[idx] = { ...updated[idx], productId: p._id, productName: p.name, price: p.price };
      }
    } else {
      updated[idx] = { ...updated[idx], [field]: field === "quantity" ? Number(value) : value };
    }
    setOrderItems(updated);
  };

  const removeItem = (idx) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) { setError("Please select a customer"); return; }
    if (orderItems.length === 0) { setError("Please add at least one product"); return; }
    setSaving(true);
    setError("");
    try {
      const customer = customers.find((c) => c._id === selectedCustomer);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer,
          customerName: customer.name,
          items: orderItems,
          totalAmount,
          note: orderNote,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create order");
      }
      setModal(false);
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAll();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      fetchAll();
    } catch {
      alert("Failed to delete order");
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-neon-pink" /> ORDERS
          </h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded hover:bg-neon-pink/20 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-dark-800 border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Order ID</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Customer</th>
                <th className="px-4 py-3 text-right text-slate-400 font-medium">Items</th>
                <th className="px-4 py-3 text-right text-slate-400 font-medium">Total (฿)</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Date</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-12">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-12">
                    No orders yet. Create your first order!
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailModal(o)}
                        className="text-neon-pink hover:underline font-mono text-xs"
                      >
                        #{o._id.slice(-6).toUpperCase()}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{o.customerName}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{o.items.length}</td>
                    <td className="px-4 py-3 text-right text-white font-semibold">
                      {o.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border bg-transparent cursor-pointer ${statusColor[o.status]} focus:outline-none`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-dark-800 text-white">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(o._id)}
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

      {/* Create Order Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-dark-700 border border-white/10 rounded-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold tracking-wider">NEW ORDER</h2>
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
              {/* Customer Select */}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Customer *</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-pink/50"
                >
                  <option value="">— Select customer —</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-400 text-xs">Products *</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-neon-pink hover:text-neon-pink/80 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {orderItems.length === 0 && (
                    <p className="text-slate-600 text-xs text-center py-4 border border-dashed border-white/10 rounded">
                      No items added yet
                    </p>
                  )}
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-dark-800 p-2 rounded border border-white/5">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(idx, "productId", e.target.value)}
                        className="flex-1 bg-dark-900 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>{p.name} (฿{p.price.toLocaleString()})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        className="w-16 bg-dark-900 border border-white/10 rounded px-2 py-1.5 text-white text-xs text-center focus:outline-none"
                      />
                      <span className="text-slate-400 text-xs w-20 text-right">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              {orderItems.length > 0 && (
                <div className="flex justify-between items-center py-2 border-t border-white/10">
                  <span className="text-slate-400 text-sm">Total</span>
                  <span className="text-white font-bold text-lg">฿{totalAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Note</label>
                <input
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-pink/50"
                  placeholder="Optional note..."
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
                  className="flex-1 px-4 py-2 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded hover:bg-neon-pink/20 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-dark-700 border border-white/10 rounded-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold tracking-wider">
                ORDER #{detailModal._id.slice(-6).toUpperCase()}
              </h2>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-1">Customer: <span className="text-white">{detailModal.customerName}</span></p>
            <p className="text-slate-400 text-sm mb-4">Date: <span className="text-white">{new Date(detailModal.createdAt).toLocaleString()}</span></p>
            <div className="space-y-2 mb-4">
              {detailModal.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-300">{item.productName} x{item.quantity}</span>
                  <span className="text-white">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-slate-400">Total</span>
              <span className="text-white font-bold">฿{detailModal.totalAmount.toLocaleString()}</span>
            </div>
            {detailModal.note && (
              <p className="text-slate-500 text-xs mt-3">Note: {detailModal.note}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
