"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Gauge, MapPin, Sparkles } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const features = [
  { title: "40% Faster Response", description: "Accelerated dispatch routing across every field team.", icon: Zap },
  { title: "30% Lower Costs", description: "Automated resource allocation and smart workflows.", icon: Gauge },
  { title: "25% Higher Productivity", description: "Streamlined task execution and real-time insight.", icon: Sparkles },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen text-zinc-100">
      <AnimatedBackground />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/15 text-cyan ring-1 ring-cyan/30">
            <Zap className="h-5 w-5" fill="currentColor" />
          </span>
          <span className="text-lg font-bold text-white">FieldForce 360</span>
        </div>
        <Link
          href="/dashboard"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-medium text-cyan">
            <MapPin className="h-3.5 w-3.5" />
            Intelligent Field Service Management
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Operational insights in one control pane
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty leading-relaxed text-zinc-400">
            FieldForce 360 combines service intelligence, live tracking, and predictive analytics for
            executive-grade field operations planning.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-indigo px-6 py-3 text-sm font-semibold text-white shadow-glow-cyan transition-shadow hover:shadow-glow-indigo"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                className="glass glass-hover p-6 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan ring-1 ring-cyan/30">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
