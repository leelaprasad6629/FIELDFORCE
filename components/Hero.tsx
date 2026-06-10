"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative -mt-6 w-full bg-[linear-gradient(180deg,#04050a_0%,#03030a_100%)]">
      <div className="mx-auto flex max-w-7xl items-center gap-12 px-6 py-20">
        <div className="flex-1">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="text-4xl font-semibold leading-tight text-white">
            FieldForce 360 — Reliable operations for enterprise field teams
          </motion.h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">A professional operations platform that consolidates dispatch, routing, and technician workflows with AI-driven insights and enterprise reliability.</p>

          <div className="mt-6 flex items-center gap-4">
            <button className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition soft-pop">Request demo</button>
            <button className="rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-sm font-semibold text-white/80 transition">Explore features</button>
          </div>

          <div className="mt-8 flex gap-6">
            <div className="rounded-md bg-white/3 p-4">
              <p className="text-xs text-slate-300">Active Technicians</p>
              <p className="mt-1 text-xl font-semibold text-white">18</p>
            </div>
            <div className="rounded-md bg-white/3 p-4">
              <p className="text-xs text-slate-300">Open Requests</p>
              <p className="mt-1 text-xl font-semibold text-white">142</p>
            </div>
            <div className="rounded-md bg-white/3 p-4">
              <p className="text-xs text-slate-300">Route Efficiency</p>
              <p className="mt-1 text-xl font-semibold text-white">89%</p>
            </div>
          </div>
        </div>

        <div className="w-[520px] shrink-0">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="h-64 w-full rounded bg-slate-900 p-4">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-28 rounded bg-slate-800" />
                  <div className="h-3 w-16 rounded bg-slate-800" />
                </div>
                <div className="flex gap-3">
                  <div className="h-28 w-2 rounded bg-emerald-400/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-800" />
                    <div className="h-3 w-2/3 rounded bg-slate-800" />
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="h-3 w-20 rounded bg-slate-800" />
                  <div className="h-3 w-16 rounded bg-slate-800" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300">Dashboard preview — realistic operational snapshot</p>
          </div>
        </div>
      </div>
    </section>
  );
}
