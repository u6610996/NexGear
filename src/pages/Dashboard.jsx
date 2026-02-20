import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, ShoppingCart, Package, Trophy, Calendar } from "lucide-react";
import StatCard from "../components/StatCard";

const PERIOD_OPTIONS = ["Daily", "Weekly", "Monthly"];
const NEON_COLORS = ["#00f5ff", "#ff2d78", "#39ff14", "#ffee00", "#a855f7", "#f97316"];

function formatPrice(n) {
  return "฿" + n.toLocaleString();
}

function getDateKey(date, period) {
  const d = new Date(date);
  if (period === "Daily") return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });
  if (period === "Monthly") return d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
  if (period === "Weekly") {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });
  }
  return "";
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-neon-cyan/30 rounded-lg p-3 shadow-neon">
        <p className="font-mono text-xs text-neon-cyan/70 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-display text-sm font-bold" style={{ color: p.color }}>
            {formatPrice(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ transactions }) {
  const [period, setPeriod] = useState("Monthly");

  // Total sales
  const totalSales = useMemo(() => transactions.reduce((s, t) => s + t.totalPrice, 0), [transactions]);
  const totalOrders = transactions.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Sales by period
  const salesByPeriod = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      const key = getDateKey(tx.date, period);
      map[key] = (map[key] || 0) + tx.totalPrice;
    });
    return Object.entries(map)
      .map(([name, sales]) => ({ name, sales }))
      .slice(-12);
  }, [transactions, period]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      const cat = tx.category || "Other";
      map[cat] = (map[cat] || 0) + tx.totalPrice;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Top 5 products
  const top5 = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      if (!map[tx.productName]) map[tx.productName] = { name: tx.productName, qty: 0, revenue: 0 };
      map[tx.productName].qty += tx.quantity;
      map[tx.productName].revenue += tx.totalPrice;
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [transactions]);

  // Sales by product bar chart
  const salesByProduct = useMemo(() => {
    return top5.map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), revenue: p.revenue }));
  }, [top5]);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="'Rajdhani'" fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-widest">
            SALES <span className="text-neon-cyan">DASHBOARD</span>
          </h1>
          <p className="font-mono text-xs text-gray-500 mt-1 tracking-widest">REAL-TIME ANALYTICS // ALL TIME</p>
        </div>
        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-dark-800 border border-neon-cyan/20 rounded-lg p-1">
          <Calendar className="w-4 h-4 text-neon-cyan/50 mx-2" />
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded font-body font-semibold text-xs tracking-wider transition-all duration-200 ${
                period === p
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/40"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatPrice(totalSales)} subtitle="All time" icon={TrendingUp} color="cyan" />
        <StatCard title="Total Orders" value={totalOrders.toLocaleString()} subtitle="Transactions" icon={ShoppingCart} color="pink" />
        <StatCard title="Avg. Order" value={formatPrice(avgOrder)} subtitle="Per transaction" icon={Package} color="green" />
        <StatCard title="Products Sold" value={top5.length > 0 ? top5[0].name.split(" ").slice(0, 2).join(" ") : "—"} subtitle="Best seller" icon={Trophy} color="yellow" />
      </div>

      {/* Charts Row 1: Line + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-dark-800 border border-neon-cyan/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-sm font-black text-white tracking-widest">SALES TREND</h2>
              <p className="font-mono text-xs text-gray-500">{period} breakdown</p>
            </div>
          </div>
          {salesByPeriod.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-600 font-mono text-sm">NO DATA YET</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesByPeriod}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f5ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "Share Tech Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "Share Tech Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="sales" stroke="#00f5ff" strokeWidth={2.5} dot={{ r: 4, fill: "#00f5ff", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#00f5ff", stroke: "rgba(0,245,255,0.3)", strokeWidth: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-dark-800 border border-neon-pink/20 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="font-display text-sm font-black text-white tracking-widest">BY CATEGORY</h2>
            <p className="font-mono text-xs text-gray-500">Revenue proportion</p>
          </div>
          {salesByCategory.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-600 font-mono text-sm">NO DATA YET</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" outerRadius={75} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {salesByCategory.map((_, i) => (
                      <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ background: "#0d1117", border: "1px solid rgba(0,245,255,0.3)", borderRadius: "8px", fontFamily: "Rajdhani" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {salesByCategory.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: NEON_COLORS[i % NEON_COLORS.length] }} />
                      <span className="font-body text-xs text-gray-400">{cat.name}</span>
                    </div>
                    <span className="font-mono text-xs text-gray-500">{formatPrice(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2: Bar + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-dark-800 border border-neon-green/20 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="font-display text-sm font-black text-white tracking-widest">TOP PRODUCTS REVENUE</h2>
            <p className="font-mono text-xs text-gray-500">By total sales amount</p>
          </div>
          {salesByProduct.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-600 font-mono text-sm">NO DATA YET</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesByProduct} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {salesByProduct.map((_, i) => (
                    <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 5 Leaderboard */}
        <div className="bg-dark-800 border border-yellow-400/20 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="font-display text-sm font-black text-white tracking-widest">TOP 5 ITEMS</h2>
            <p className="font-mono text-xs text-gray-500">Best selling products</p>
          </div>
          {top5.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-600 font-mono text-sm">NO DATA YET</div>
          ) : (
            <div className="space-y-3">
              {top5.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded flex items-center justify-center font-display text-sm font-black flex-shrink-0 ${
                    i === 0 ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/40" :
                    i === 1 ? "bg-gray-400/20 text-gray-400 border border-gray-400/40" :
                    i === 2 ? "bg-orange-600/20 text-orange-400 border border-orange-400/40" :
                    "bg-dark-600 text-gray-600 border border-gray-600/40"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs font-semibold text-gray-300 truncate">{item.name}</p>
                    <p className="font-mono text-xs text-gray-600">{item.qty} units</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-xs text-neon-cyan">{formatPrice(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
