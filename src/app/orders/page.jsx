"use client";
import { useEffect, useState } from "react";
import { Trash2, X, ShoppingCart, Package } from "lucide-react";

const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];

const statusStyle = {
  pending:    "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  completed:  "text-neon-green bg-neon-green/10 border-neon-green/30",
  cancelled:  "text-red-400 bg-red-400/10 border-red-400/30",
};

const statusLabel = {
  pending:    "Pending",
  processing: "Processing",
  completed:  "Completed",
  cancelled:  "Cancelled",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (order, newStatus) => {
    if (order.status === newStatus) return;
    setUpdatingId(order._id);
    try {
      await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchOrders();
      // Update detail modal if open
      if (detailOrder?._id === order._id) {
        setDetailOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    setDetailOrder(null);
    fetchOrders();
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-neon-pink" /> ORDERS
        </h1>
        <p className="text-slate-400 text-sm mt-1">All orders</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 border border-yellow-400/20 rounded-lg px-4 py-3">
          <p className="text-slate-400 text-xs mb-1">Pending</p>
          <p className="text-yellow-400 font-bold text-xl">{pendingCount}</p>
        </div>
        <div className="bg-dark-800 border border-neon-green/20 rounded-lg px-4 py-3">
          <p className="text-slate-400 text-xs mb-1">Completed</p>
          <p className="text-neon-green font-bold text-xl">{completedCount}</p>
        </div>
        <div className="bg-dark-800 border border-neon-cyan/20 rounded-lg px-4 py-3">
          <p className="text-slate-400 text-xs mb-1">Total Revenue</p>
          <p className="text-neon-cyan font-bold text-xl">฿{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-dark-800 border border-white/5 rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center text-slate-500 py-16">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            No orders yet — place orders from the Customers page
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((o) => (
              <div key={o._id} className="px-5 py-4 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-4">

                  {/* Left: customer + items */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{o.customerName}</span>
                      <span className="text-slate-600 text-xs font-mono">
                        #{o._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                    {/* Items summary */}
                    <div className="flex flex-wrap gap-1">
                      {o.items.map((item, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-slate-300"
                        >
                          <Package className="w-2.5 h-2.5 text-slate-500" />
                          {item.productName} ×{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: total + status + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-white font-bold text-lg">
                      ฿{o.totalAmount.toLocaleString()}
                    </span>

                    {/* Status selector */}
                    <select
                      value={o.status}
                      disabled={updatingId === o._id}
                      onChange={(e) => updateStatus(o, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border bg-transparent cursor-pointer focus:outline-none transition-colors ${statusStyle[o.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-dark-800 text-white">
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailOrder(o)}
                        className="text-xs text-slate-500 hover:text-neon-pink transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDelete(o._id)}
                        className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock deduction notice */}
                {o.status !== "pending" && (
                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block" />
                    Stock deducted
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-dark-700 border border-white/10 rounded-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold tracking-wider">
                  Order Details
                </h2>
                <p className="text-slate-500 text-xs font-mono mt-0.5">
                  #{detailOrder._id.slice(-6).toUpperCase()}
                </p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer</span>
                <span className="text-white font-medium">{detailOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-white text-xs">{new Date(detailOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle[detailOrder.status]}`}>
                  {statusLabel[detailOrder.status]}
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mb-4 space-y-2">
              {detailOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-300">
                    {item.productName} <span className="text-slate-500">×{item.quantity}</span>
                  </span>
                  <span className="text-white">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-white/10 pt-3 mb-5">
              <span className="text-slate-400">Total</span>
              <span className="text-white font-bold text-lg">฿{detailOrder.totalAmount.toLocaleString()}</span>
            </div>

            {detailOrder.note && (
              <p className="text-slate-500 text-xs mb-4">Note: {detailOrder.note}</p>
            )}

            <button
              onClick={() => handleDelete(detailOrder._id)}
              className="w-full py-2 border border-red-500/20 text-red-400 rounded hover:bg-red-500/10 text-sm transition-colors"
            >
              Delete Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
