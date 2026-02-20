export default function StatCard({ title, value, subtitle, icon: Icon, color = "cyan", trend }) {
  const colors = {
    cyan: {
      border: "border-neon-cyan/30",
      text: "text-neon-cyan",
      bg: "bg-neon-cyan/5",
      glow: "shadow-neon",
      icon: "text-neon-cyan",
    },
    pink: {
      border: "border-neon-pink/30",
      text: "text-neon-pink",
      bg: "bg-neon-pink/5",
      glow: "shadow-neon-pink",
      icon: "text-neon-pink",
    },
    green: {
      border: "border-neon-green/30",
      text: "text-neon-green",
      bg: "bg-neon-green/5",
      glow: "shadow-neon-green",
      icon: "text-neon-green",
    },
    yellow: {
      border: "border-yellow-400/30",
      text: "text-yellow-400",
      bg: "bg-yellow-400/5",
      glow: "shadow-lg",
      icon: "text-yellow-400",
    },
  };

  const c = colors[color];

  return (
    <div className={`relative rounded-xl border ${c.border} ${c.bg} p-5 overflow-hidden group transition-all duration-300 hover:${c.glow}`}>
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${c.bg} rounded-bl-full opacity-50`} />
      <div className={`absolute top-0 right-0 w-1 h-8 ${c.text} opacity-30`} style={{ background: "currentColor" }} />
      <div className={`absolute top-0 right-8 h-1 w-8 ${c.text} opacity-30`} style={{ background: "currentColor" }} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-2">{title}</p>
          <p className={`font-display text-2xl font-black ${c.text} tracking-wide`}>{value}</p>
          {subtitle && <p className="font-body text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${trend >= 0 ? "text-neon-green" : "text-neon-pink"}`}>
              <span>{trend >= 0 ? "▲" : "▼"}</span>
              <span>{Math.abs(trend).toFixed(1)}% vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent ${c.text} opacity-20`} />
    </div>
  );
}
