"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { LayoutDashboard, MapPin, ClipboardList, BarChart3, HardHat, Star, Zap } from "lucide-react";
import { homePathForRole, type UserRole } from "@/lib/roles";

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["manager"] as UserRole[] },
  { label: "Live Map", href: "/map", icon: MapPin, roles: ["manager"] as UserRole[] },
  { label: "Requests", href: "/requests", icon: ClipboardList, roles: ["manager"] as UserRole[] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["manager"] as UserRole[] },
  { label: "Technician", href: "/technician", icon: HardHat, roles: ["technician"] as UserRole[] },
  { label: "Reviews", href: "/reviews", icon: Star, roles: ["manager"] as UserRole[] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as UserRole | undefined;
  const navItems = role ? allNavItems.filter((item) => item.roles.includes(role)) : allNavItems;
  const homeHref = role ? homePathForRole(role) : "/dashboard";

  return (
    <aside className="group fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-xl transition-[width] duration-300 ease-out hover:w-60 lg:flex">
      <Link
        href={homeHref}
        className="flex h-16 items-center gap-3 overflow-hidden border-b border-white/10 px-[18px]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan/15 text-cyan ring-1 ring-cyan/30">
          <Zap className="h-5 w-5" fill="currentColor" />
        </span>
        <span className="whitespace-nowrap text-base font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          FieldForce 360
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-[10px] py-3 transition-colors duration-200 ${
                active
                  ? "bg-cyan/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-r bg-cyan transition-all duration-300 ${
                  active ? "h-6 shadow-glow-cyan" : "group-hover:h-3"
                }`}
              />
              <Icon className={`h-5 w-5 shrink-0 ${active ? "text-cyan" : ""}`} />
              <span className="whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-xl px-[10px] py-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
          </span>
          <span className="whitespace-nowrap text-xs text-zinc-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            All systems nominal
          </span>
        </div>
      </div>
    </aside>
  );
}
