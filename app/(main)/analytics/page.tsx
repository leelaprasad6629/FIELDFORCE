"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Clock, Target, Gauge, ArrowUpRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import CountUp from "@/components/CountUp";
import DelayChart from "@/components/analytics/DelayChart";
import VelocityChart from "@/components/analytics/VelocityChart";
import SatisfactionRing from "@/components/analytics/SatisfactionRing";

interface AnalyticsData {
  hasEnoughData: boolean;
  predictedCsat: number | null;
  predictiveAccuracy: number | null;
  routingUplift: number | null;
  avgResponseMinutes: number | null;
  firstTimeFixRate: number | null;
  fleetUtilization: number | null;
  dailyThroughput: number | null;
  velocity: { day: string; tasks: number }[];
  delays: { day: string; delay: number | null }[];
}

function Card({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={`glass p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function MetricValue({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  if (value === null) {
    return <span className="text-sm text-zinc-500">Not enough data yet</span>;
  }
  return <CountUp value={value} suffix={suffix} />;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const kpis = [
    {
      label: "Avg. Response Time",
      value: data?.avgResponseMinutes ?? null,
      suffix: "m",
      icon: Clock,
      accent: "text-cyan ring-cyan/30 bg-cyan/10",
    },
    {
      label: "First-Time Fix Rate",
      value: data?.firstTimeFixRate ?? null,
      suffix: "%",
      icon: Target,
      accent: "text-emerald ring-emerald/30 bg-emerald/10",
    },
    {
      label: "Fleet Utilization",
      value: data?.fleetUtilization ?? null,
      suffix: "%",
      icon: Gauge,
      accent: "text-indigo ring-indigo/30 bg-indigo/10",
    },
    {
      label: "Weekly Throughput",
      value: data?.dailyThroughput ?? null,
      suffix: "",
      icon: Activity,
      accent: "text-amber ring-amber/30 bg-amber/10",
    },
  ];

  return (
    <div>
      <PageHero
        title="Predictive performance and trend forecasting"
        subtitle="Trusted metrics for service completion, delays, and satisfaction across the entire field ecosystem."
      />

      {loading ? (
        <div className="glass p-8 text-center text-sm text-zinc-500">Loading analytics...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Predictive Service Delay</h3>
                  <p className="text-sm text-zinc-400">Average delay hours by weekday</p>
                </div>
                <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan ring-1 ring-cyan/30">
                  Forecast window active
                </span>
              </div>
              <div className="mt-6">
                <DelayChart data={data?.delays ?? []} />
              </div>
              <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
                Delay metrics are computed from completed task ETAs and actual completion times.
              </p>
            </Card>

            <Card delay={0.1}>
              <h3 className="text-lg font-bold text-white">Customer Satisfaction Predictor</h3>
              <div className="mt-4 flex justify-center">
                {data?.predictedCsat === null ? (
                  <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full border border-dashed border-white/10 text-sm text-zinc-500">
                    Not enough data yet
                  </div>
                ) : (
                  <SatisfactionRing value={data?.predictedCsat ?? 0} />
                )}
              </div>
              <p className="mt-2 text-center text-sm text-zinc-400">
                Derived from completion rate and average response time.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-zinc-500">Predictive accuracy</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    <MetricValue value={data?.predictiveAccuracy ?? null} suffix="%" />
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-zinc-500">Routing uplift</p>
                  {data?.routingUplift === null || data?.routingUplift === undefined ? (
                    <p className="mt-1 text-sm text-zinc-500">Not enough data yet</p>
                  ) : (
                    <p className="mt-1 flex items-center gap-1 text-xl font-bold text-emerald">
                      <ArrowUpRight className="h-5 w-5" />
                      {data.routingUplift > 0 ? "+" : ""}
                      {data.routingUplift}%
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500">vs prior week</p>
                </div>
              </div>
            </Card>
          </div>

          <Card delay={0.15}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Task Velocity</h3>
                <p className="text-sm text-zinc-400">Completed tasks by weekday</p>
              </div>
              {data?.hasEnoughData ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald">
                  <TrendingUp className="h-4 w-4" />
                  Live data
                </span>
              ) : (
                <span className="text-sm text-zinc-500">Not enough data yet</span>
              )}
            </div>
            <div className="mt-6">
              <VelocityChart data={data?.velocity ?? []} />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.08 }}
                  className="glass glass-hover group relative overflow-hidden p-5"
                >
                  <div className="shimmer-overlay" />
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${kpi.accent}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-4 text-3xl font-bold text-white">
                    <MetricValue value={kpi.value} suffix={kpi.suffix} />
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{kpi.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
