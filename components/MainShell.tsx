"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Globe2, Layers, MapPin, PieChart, UserCircle2 } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Activity },
  { label: "Live Map", href: "/map", icon: MapPin },
  { label: "Requests", href: "/requests", icon: Layers },
  { label: "Analytics", href: "/analytics", icon: PieChart },
  { label: "Technician", href: "/technician", icon: Globe2 },
];

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isTechnicianView = pathname?.startsWith("/technician");

  return (
    <div className="min-h-screen bg-surface text-slate-100">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent to-black/20" />
      <div className="relative mx-auto flex min-h-screen max-w-[1800px] overflow-hidden px-4 py-6 lg:px-8">
        <aside className="hidden w-72 flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 px-5 py-6 shadow-sm lg:flex">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[28px] bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20">
                <span className="text-2xl font-semibold">PL</span>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-violet-300">FieldForce 360</p>
                <p className="text-sm font-semibold text-white">Operational Workspace</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-surface2 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Project lead</p>
                <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/15 text-2xl text-violet-100">PL</div>
                <div>
                  <p className="text-base font-semibold text-white">Project Lead</p>
                  <p className="mt-1 text-sm text-slate-400">Enterprise Administrator</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" />
                    <span>System Connection: Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-surface2 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Mode Selector</p>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-white/5 p-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${!isTechnicianView ? "bg-violet-500/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/technician")}
                  className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${isTechnicianView ? "bg-violet-500/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  Technician
                </button>
              </div>
            </div>
          </div>
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-violet-500/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  <Icon className="h-5 w-5 text-violet-300" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-3xl border border-white/10 bg-surface2 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Enterprise status</p>
            <p className="mt-2 text-sm leading-6">All systems nominal. Real-time telemetry and routing pipelines are fully operational.</p>
          </div>
        </aside>

        <main className="flex-1 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm lg:ml-6">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-surface2 p-5 shadow-inner shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Intelligent field operations hub</h1>
              <p className="mt-1 text-sm text-slate-300">Manage service requests, live tracking, analytics, and technician execution in one console.</p>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-violet-500/10 bg-[rgba(255,255,255,0.03)] p-4 soft-pop">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Project lead</p>
                <p className="text-sm font-semibold text-white">Project Lead</p>
                <p className="text-xs text-slate-400">Enterprise Administrator</p>
              </div>
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">PL</div>
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
