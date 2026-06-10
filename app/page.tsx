"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";

const features = [
  {
    title: "40% Faster Response",
    description: "Dynamic dispatch triggers faster arrival windows across all field teams.",
  },
  {
    title: "30% Lower Costs",
    description: "Optimize routes and resource allocation with smart workflow automation.",
  },
  {
    title: "25% Higher Productivity",
    description: "Modern technician tools and real-time insights boost service throughput.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({ email: "", password: "", name: "" });

  return (
    <main className="min-h-screen bg-surface text-white">
      <Hero />

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="relative z-10 grid gap-10 rounded-[24px] p-1">
          <section className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-violet-300">FieldForce 360</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Trusted features for modern field teams</h2>
              <p className="mt-4 text-lg text-slate-300">Bring managers and technicians together in one high-fidelity control center with mock dashboards, route visualization, and AI-inspired assignment workflows.</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                  <div key={feature.title} className="rounded-3xl border border-white/10 bg-surface2 p-5 transition-shadow hover:shadow-md soft-pop">
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="rounded-3xl border border-white/10 bg-surface2 p-8">
              <p className="text-sm uppercase tracking-[0.36em] text-violet-300">Pure frontend demo</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Sign in or create a mock account.</h3>
              <p className="mt-2 text-sm text-slate-300">No email or phone OTP needed. Use the buttons below to access the dashboard instantly.</p>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8">
              <input
                value={formState.email}
                onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                placeholder="Email"
                className="w-full rounded-3xl border border-white/10 bg-surface p-4 text-white outline-none transition focus:border-violet-400"
              />
              <input
                type="password"
                value={formState.password}
                onChange={(event) => setFormState({ ...formState, password: event.target.value })}
                placeholder="Password"
                className="w-full rounded-3xl border border-white/10 bg-surface p-4 text-white outline-none transition focus:border-violet-400"
              />
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-3xl bg-violet-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Sign Up
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
