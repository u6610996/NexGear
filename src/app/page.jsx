"use client";
import { useEffect, useState } from "react";
import { Package, Users, ShoppingCart, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    revenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [pRes, cRes, oRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/customers"),
          fetch("/api/orders"),
        ]);
        const [products, customers, orders] = await Promise.all([
          pRes.json(),
          cRes.json(),
          oRes.json(),
        ]);

        const revenue = orders
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          products: products.length,
          customers: customers.length,
          orders: orders.length,
          revenue,
          recentOrders: orders.slice(0, 5),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.products,
      icon: Package,
      color: "text-neon-cyan",
      border: "border-neon-cyan/20",
      href: "/products",
    },
    {
      label: "Total Customers",
      value: stats.customers,
      icon: Users,
      color: "text-neon-green",
      border: "border-neon-green/20",
      href: "/customers",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "text-neon-pink",
      border: "border-neon-pink/20",
      href: "/orders",
    },
    {
      label: "Revenue (Completed)",
      value: `฿${stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-yellow-400",
      border: "border-yellow-400/20",
      href: "/orders",
    },
  ];

  const statusColor = {
    pending: "text-yellow-400 bg-yellow-400/10",
    processing: "text-blue-400 bg-blue-400/10",
    completed: "text-neon-green bg-neon-green/10",
    cancelled: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          DASHBOARD
        </h1>
        <p className="text-slate-400 text-sm mt-1">NexGear Sales Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, border, href }) => (
          <Link
            key={label}
            href={href}
            className={`bg-dark-800 border ${border} rounded-lg p-5 hover:bg-dark-700 transition-colors group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{label}</span>
              <Icon className={`w-5 h-5 ${color} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>
              {loading ? "—" : value}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-dark-800 border border-white/5 rounded-lg">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
          <Clock className="w-4 h-4 text-neon-cyan" />
          <h2 className="text-white font-semibold text-sm tracking-wider">RECENT ORDERS</h2>
        </div>
        {loading ? (
          <div className="px-5 py-10 text-center text-slate-500">Loading...</div>
        ) : stats.recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500">No orders yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{order.customerName}</p>
                  <p className="text-slate-500 text-xs">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-semibold">
                    ฿{order.totalAmount.toLocaleString()}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-5 py-3 border-t border-white/5">
          <Link href="/orders" className="text-neon-cyan text-sm hover:underline">
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  );
}
