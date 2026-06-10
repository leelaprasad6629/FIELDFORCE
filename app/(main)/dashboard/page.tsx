import { CalendarDays, Rocket, Sparkles } from "lucide-react";

const metrics = [
  { label: "Faster Response", value: "40%", description: "Accelerated dispatch routing" },
  { label: "Lower Costs", value: "30%", description: "Automated resource allocation" },
  { label: "Higher Productivity", value: "25%", description: "Streamlined task execution" },
];

const technicians = [
  { name: "Alex Rivera", status: "On Route", detail: "Task #104" },
  { name: "Sarah Chen", status: "On Site", detail: "Geo-fenced Check-In Approved" },
  { name: "Marcus Vance", status: "Idle", detail: "Break" },
];

const alerts = [
  "[11:42 AM] System optimized route for Task #105 via AI Router",
  "[11:38 AM] Sarah Chen geo-fenced check-in verified at Client Zone Delta",
  "[11:30 AM] High-priority technician alert triggered for standalone zone review",
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Manager dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Operational insights in one control pane</h2>
            <p className="mt-2 text-sm text-slate-300">FieldForce 360 combines service intelligence, live tracking, and analytics for executive-grade planning.</p>
          </div>
          <div className="rounded-3xl bg-violet-500/10 px-5 py-4 text-white shadow-inner shadow-violet-500/10">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-200">Current primary goal</p>
            <p className="mt-2 text-lg font-semibold">Optimize end-to-end field coverage</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric, i) => (
          <div key={metric.label} className="card p-6 soft-pop transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">{metric.label}</p>
              <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-200">
                <Sparkles size={20} />
              </div>
            </div>
            <p className="mt-5 text-4xl font-semibold text-white">{metric.value}</p>
            <p className="mt-3 text-sm text-slate-300">{metric.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Real-Time Field Operations</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Active technician flow</h3>
            </div>
            <span className="rounded-3xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Live data</span>
          </div>
          <div className="mt-6 space-y-4">
            {technicians.map((tech) => (
              <div key={tech.name} className="rounded-3xl border border-white/10 bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{tech.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{tech.detail}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${tech.status === "On Route" ? "bg-violet-500/10 text-violet-200" : tech.status === "On Site" ? "bg-emerald-500/10 text-emerald-200" : "bg-slate-700 text-slate-200"}`}>
                    {tech.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Live Alert Feed</p>
          <div className="mt-5 space-y-3">
            {alerts.map((alert) => (
              <div key={alert} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p>{alert}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="card p-6 soft-pop transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 text-white">
            <CalendarDays size={20} />
            <h3 className="text-lg font-semibold">Service Requests</h3>
          </div>
          <p className="mt-4 text-5xl font-semibold text-white">142</p>
          <p className="mt-3 text-sm text-slate-300">Pending and active workloads</p>
        </div>
        <div className="card p-6 soft-pop transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 text-white">
            <CalendarDays size={20} />
            <h3 className="text-lg font-semibold">Active Technicians</h3>
          </div>
          <p className="mt-4 text-5xl font-semibold text-white">18</p>
          <p className="mt-3 text-sm text-slate-300">Field staff currently online</p>
        </div>
        <div className="card p-6 soft-pop transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 text-white">
            <CalendarDays size={20} />
            <h3 className="text-lg font-semibold">Task Overview</h3>
          </div>
          <p className="mt-4 text-5xl font-semibold text-white">72</p>
          <p className="mt-3 text-sm text-slate-300">Tasks in execution across zones</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Executive overview</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Risk-managed field performance</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <Rocket size={18} />
            <span>Smart workload balancing keeps techs engaged and customers satisfied.</span>
          </div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Dispatch readiness</p>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold text-white">96%</p>
                <p className="mt-2 text-sm text-slate-300">Service windows met</p>
              </div>
              <div className="h-24 w-24 rounded-3xl bg-violet-500/10"></div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Task velocity</p>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold text-white">85</p>
                <p className="mt-2 text-sm text-slate-300">Active operations in the last hour</p>
              </div>
              <div className="h-24 w-24 rounded-3xl bg-violet-500/10"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
