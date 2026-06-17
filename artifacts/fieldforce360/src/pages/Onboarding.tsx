import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Briefcase, Wrench, ArrowRight, Loader2 } from "lucide-react";
import { useApi } from "../lib/api";
import { useUser } from "@clerk/clerk-react";

export default function Onboarding() {
  const [selected, setSelected] = useState<"manager" | "technician" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchApi } = useApi();
  const { reload } = useUser();
  const [, navigate] = useLocation();

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      await fetchApi("/user/role", { method: "POST", body: JSON.stringify({ role: selected }) });
      await reload();
      navigate(selected === "manager" ? "/dashboard" : "/technician");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to set role. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#080C14" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Choose Your Role</h1>
          <p className="text-slate-400 text-sm mb-8">This sets your dashboard view and permissions.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { role: "manager" as const, icon: Briefcase, label: "Manager", desc: "Dispatch, analytics, full oversight", color: "cyan" },
              { role: "technician" as const, icon: Wrench, label: "Technician", desc: "View tasks, update status, log expenses", color: "indigo" },
            ].map(({ role, icon: Icon, label, desc, color }) => (
              <button key={role} onClick={() => setSelected(role)}
                className={`p-5 rounded-xl border transition-all text-left ${selected === role
                  ? `border-${color}-500/60 bg-${color}-500/15`
                  : "border-white/10 bg-white/5 hover:bg-white/8"}`}>
                <Icon className={`w-7 h-7 mb-3 ${selected === role ? `text-${color}-400` : "text-slate-400"}`} />
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>

          {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

          <button onClick={handleConfirm} disabled={!selected || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2 transition hover:opacity-90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Continue</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
