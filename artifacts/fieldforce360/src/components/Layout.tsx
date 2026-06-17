import { Link, useLocation } from "wouter";
import { useRole } from "../hooks/useRole";
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Map, ClipboardList, BarChart2, UserSquare2, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

const managerNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Map", icon: Map, href: "/map" },
  { label: "Requests", icon: ClipboardList, href: "/requests" },
  { label: "Analytics", icon: BarChart2, href: "/analytics" },
];

const technicianNav = [
  { label: "My Tasks", icon: UserSquare2, href: "/technician" },
  { label: "Map", icon: Map, href: "/map" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = role === "manager" ? managerNav : technicianNav;

  return (
    <div className="flex min-h-screen" style={{ background: "#080C14" }}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-col flex transition-transform duration-300 md:translate-x-0 glass",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "md:static md:flex border-r border-white/10 rounded-none"
      )}>
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FieldForce<span className="text-cyan-400">360</span></span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline",
              location === href
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 capitalize">{role ?? "user"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="flex md:hidden items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold">FieldForce<span className="text-cyan-400">360</span></span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
