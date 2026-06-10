import { Circle, MapPin, Shield, Sparkles, Waves } from "lucide-react";

const locations = [
  {
    label: "Project West",
    coords: "41.88, -87.62",
    status: "Geo-fence active",
    lead: "Alex Rivera",
  },
  {
    label: "East Retail",
    coords: "34.05, -118.24",
    status: "Technician inbound",
    lead: "Sarah Chen",
  },
  {
    label: "South Depot",
    coords: "29.76, -95.36",
    status: "Optimal route set",
    lead: "Marcus Vance",
  },
];

const routeHighlights = [
  { label: "Live route efficiency", value: "89%", accent: "bg-emerald-500/10 text-emerald-200" },
  { label: "Active zones", value: "12", accent: "bg-violet-500/10 text-violet-200" },
  { label: "Arrival confidence", value: "95%", accent: "bg-sky-500/10 text-sky-200" },
];

export default function MapPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Live tracking</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Field technician geo-visualization</h2>
            <p className="mt-2 text-sm text-slate-300">Monitor active units, geofenced customer zones, next-mile routes, and arrival certainty in real time.</p>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-violet-300" />
              <span>Secure operational tracking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,.16),_transparent_28%)]" />
                <div className="relative z-10 flex items-center justify-between gap-4 text-slate-300 soft-pop">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Command map</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Operational map overview</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-200 ring-1 ring-emerald-300/10">
                <Circle className="h-2.5 w-2.5 text-emerald-300" /> Live
              </span>
            </div>

            <div className="mt-6 h-[520px] rounded-[28px] border border-dashed border-white/10 bg-slate-900/80 p-6 shadow-inner shadow-black/20">
              <div className="relative h-full overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_30%,rgba(79,70,229,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.14),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_25%)]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_60%)]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Cpath fill=\'none\' stroke=\'rgba(148,163,184,0.12)\' stroke-width=\'1\' d=\'M0 20h40M20 0v40\'/%3E%3C/svg%3E')] opacity-70" />
                <div className="absolute left-[12%] top-[22%] flex flex-col items-center gap-2 text-slate-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 shadow-[0_0_25px_rgba(168,85,247,0.22)]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Project West</span>
                </div>
                <div className="absolute left-[45%] top-[35%] rounded-full bg-emerald-500/10 p-4 text-slate-100 shadow-[0_0_20px_rgba(34,197,94,0.18)]">
                  <Waves className="h-5 w-5" />
                </div>
                <div className="absolute left-[70%] top-[58%] rounded-full bg-sky-500/10 p-4 text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.18)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="absolute inset-x-0 bottom-8 flex justify-center gap-6 text-[11px] uppercase tracking-[0.34em] text-slate-400">
                  <span>Geo-fenced perimeter</span>
                  <span>Route cluster</span>
                  <span>Arrival window</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Route highlights</p>
            <div className="mt-5 space-y-4">
              {routeHighlights.map((item) => (
                <div key={item.label} className={`rounded-3xl border border-white/10 ${item.accent} p-4`}>
                  <p className="text-sm text-slate-300">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {locations.map((location) => (
            <div key={location.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{location.label}</p>
                  <p className="mt-1 text-sm text-slate-300">Lead: {location.lead}</p>
                </div>
                <div className="rounded-3xl bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-violet-200">Live</div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                <MapPin size={18} className="text-violet-300" />
                <span>{location.coords}</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
                <Sparkles size={18} className="text-sky-300" />
                <span>{location.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
