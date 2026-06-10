const delayValues = [
  { day: "Mon", height: "h-12", label: "1.2h" },
  { day: "Tue", height: "h-24", label: "2.4h" },
  { day: "Wed", height: "h-32", label: "3.0h" },
  { day: "Thu", height: "h-20", label: "1.8h" },
  { day: "Fri", height: "h-28", label: "2.8h" },
];

const satisfaction = {
  score: 94.2,
  detail: "Based on historical routing optimization patterns.",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Operational analytics</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Predictive performance and trend forecasting</h2>
        <p className="mt-2 text-sm text-slate-300">Trusted metrics for service completion, delays, and satisfaction across the entire field ecosystem.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Predictive Service Delay</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Delay bar graph</h3>
            </div>
            <span className="rounded-3xl bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-violet-200">Forecast window</span>
          </div>

          <div className="mt-8 grid gap-5 rounded-3xl bg-surface p-6">
            <div className="flex items-end justify-between gap-4 min-h-[220px]">
              {delayValues.map((segment) => (
                <div key={segment.day} className="flex flex-col items-center gap-3">
                  <div className={`flex h-48 w-12 items-end justify-center rounded-3xl bg-slate-900 ${segment.height}`}>
                    <div className="w-full rounded-t-3xl bg-gradient-to-t from-violet-500 to-fuchsia-500 text-[10px] text-white/90 text-center leading-none">{segment.label}</div>
                  </div>
                  <p className="text-sm text-slate-300">{segment.day}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-white/10 bg-surface2 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Delay factors</p>
              <p className="mt-2">AI predicts routing delays from weather, traffic, and customer arrival windows.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Customer Satisfaction Predictor</p>
          <h3 className="mt-3 text-5xl font-semibold text-emerald-400">{satisfaction.score}%</h3>
          <p className="mt-2 text-sm text-slate-300">Predicted CSAT</p>
          <div className="mt-6 rounded-3xl bg-white/5 p-5 text-slate-300">
            <p className="text-sm">{satisfaction.detail}</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Predictive accuracy</p>
                <p className="mt-2 text-lg font-semibold text-white">89.7%</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Routing uplift</p>
                <p className="mt-2 text-lg font-semibold text-white">21% better than last week</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
