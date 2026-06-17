"use client";

import { useCallback, useEffect, useState } from "react";
import PageHero from "@/components/PageHero";
import StatCards, { type DashboardStats } from "@/components/dashboard/StatCards";
import GoalBanner from "@/components/dashboard/GoalBanner";
import TechnicianFlow, { type TechnicianData } from "@/components/dashboard/TechnicianFlow";
import AlertFeed, { type AlertData } from "@/components/dashboard/AlertFeed";

const POLL_INTERVAL_MS = 20000;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (initial = false) => {
    try {
      const [statsRes, techRes, alertsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/technicians"),
        fetch("/api/alerts"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (techRes.ok) setTechnicians(await techRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
    const interval = window.setInterval(() => fetchDashboardData(false), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div>
      <PageHero
        title="Operational insights in one control pane"
        subtitle="FieldForce 360 combines service intelligence, live tracking, and analytics for executive-grade planning."
      />

      <div className="space-y-6">
        <StatCards stats={stats} loading={loading} />
        <GoalBanner />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <TechnicianFlow technicians={technicians} loading={loading} />
          <AlertFeed alerts={alerts} loading={loading} />
        </div>
      </div>
    </div>
  );
}
