"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";

interface AssignmentModalProps {
  request: {
    id: string;
    title: string;
    status: string;
    priority: string;
    assignedTechnicianId?: string;
  };
  onAssign: (id: string) => void;
}

const mockTechnicians = [
  { name: "Alex Rivera", score: 98, distance: 2.4, specialty: "Network Routing" },
  { name: "Sarah Chen", score: 94, distance: 3.1, specialty: "Geo-fence Verification" },
  { name: "Marcus Vance", score: 90, distance: 4.8, specialty: "Critical Repairs" },
];

export default function AssignmentModal({ request, onAssign }: AssignmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchReady, setMatchReady] = useState(false);
  const selected = useMemo(() => mockTechnicians[0], []);

  useEffect(() => {
    if (!isOpen) {
      setIsAnalyzing(false);
      setMatchReady(false);
    }
  }, [isOpen]);

  const openDialog = () => {
    setIsOpen(true);
    setIsAnalyzing(true);
    setMatchReady(false);
    window.setTimeout(() => {
      setIsAnalyzing(false);
      setMatchReady(true);
    }, 1500);
  };

  const approveDispatch = () => {
    onAssign(request.id);
    setIsOpen(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-2 rounded-2xl bg-violet-500/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500/30"
      >
        <ShieldCheck size={16} />
        Smart AI Assignment
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 backdrop-blur-xl">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-surface p-6 shadow-xl shadow-violet-500/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Smart AI Assignment</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Scanning closest available technicians</h2>
                <p className="mt-2 text-sm text-slate-300">AI scanning closest available technicians based on skills and proximity...</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-violet-500/20 bg-white/5 p-6">
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center text-slate-300">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-500/40 border-t-violet-300" />
                  <p className="text-sm">Analyzing geo-location, skills cache, and dispatch readiness...</p>
                </div>
              ) : null}
              {matchReady ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-surface p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">Best Match Recommended</p>
                        <p className="mt-1 text-sm text-slate-400">{selected.name} ({selected.specialty})</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">98% Match Score</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-300">Distance: {selected.distance.toFixed(1)}km away</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={approveDispatch}
                      className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                    >
                      Approve Dispatch
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
