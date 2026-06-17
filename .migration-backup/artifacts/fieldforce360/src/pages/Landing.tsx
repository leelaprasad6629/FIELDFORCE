import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Shield, BarChart2, Map, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10", title: "Smart Dispatch", desc: "AI-powered routing assigns the nearest technician instantly." },
  { icon: Shield, color: "text-indigo-400", bg: "bg-indigo-500/10", title: "Geofence Verification", desc: "Location-based job check-in keeps your data accurate." },
  { icon: BarChart2, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Predictive Analytics", desc: "Live KPIs, velocity charts, and delay heatmaps." },
  { icon: Map, color: "text-amber-400", bg: "bg-amber-500/10", title: "Live Fleet Map", desc: "Real-time technician positions across all zones." },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080C14" }}>
      {/* Hero */}
      <header className="relative overflow-hidden flex flex-col items-center justify-center py-28 px-4 text-center">
        {/* Blobs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: "#06B6D4", animation: "blob-one 8s ease-in-out infinite" }} />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: "#6366F1", animation: "blob-two 12s ease-in-out infinite" }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" />
            Field Service Management Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
            FieldForce<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">360</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-xl mx-auto mb-10">
            Dispatch, track, and analyze your field teams — with smart routing, real-time maps, and predictive insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-base hover:opacity-90 transition no-underline">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 text-slate-300 font-semibold text-base hover:bg-white/5 transition no-underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(({ icon: Icon, color, bg, title, desc }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
            className="glass glass-hover p-6 group">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="text-white font-semibold mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Trust strip */}
      <section className="border-t border-white/8 py-12 px-4">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-slate-400">
          {["Role-based access control", "MongoDB-backed persistence", "Clerk authentication", "Live WebSocket-ready"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
