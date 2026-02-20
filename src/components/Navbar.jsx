"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Package, Users, ShoppingCart, LayoutDashboard } from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-800 border-b border-neon-cyan/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-cyan" />
          <span className="text-white font-bold text-lg tracking-widest">
            NEX<span className="text-neon-cyan">GEAR</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  active
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
