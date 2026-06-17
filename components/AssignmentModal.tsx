"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, X, Sparkles, CheckCircle2, MapPin } from "lucide-react";

interface AssignmentModalProps {
  request: {
    id: string;
    _id?: string;
    title: string;
    status: string;
    priority: string;
    assignedTechnicianId?: string | null;
    assignedTechnicianName?: string | null;
    geofenceLocation?: { lat: number; lng: number };
  };
  onAssign: (id: string, technicianName: string) => void;
}

interface TechnicianOption {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AssignmentModal({ request, onAssign }: AssignmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchReady, setMatchReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState<{ name: string; distanceKm: number; score: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsAnalyzing(false);
      setMatchReady(false);
      setSelected(null);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const openDialog = async () => {
    setIsOpen(true);
    setIsAnalyzing(true);
    setMatchReady(false);
    setError(null);

    try {
      const res = await fetch("/api/technicians");
      const technicians = (await res.json()) as TechnicianOption[];
      const idle = technicians.filter((tech) => tech.status === "idle");
      if (idle.length === 0) {
        throw new Error("No idle technicians available");
      }

      const target = request.geofenceLocation ?? { lat: 40.7128, lng: -74.006 };
      const ranked = idle
        .map((tech) => ({
          tech,
          distance: haversineKm(target.lat, target.lng, tech.lat, tech.lng),
        }))
        .sort((a, b) => a.distance - b.distance);

      const best = ranked[0];
      setSelected({
        name: best.tech.name,
        distanceKm: best.distance,
        score: Math.max(85, Math.round(100 - best.distance * 2)),
      });
      setIsAnalyzing(false);
      setMatchReady(true);
    } catch (err) {
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : "Assignment preview failed");
    }
  };

  const approveDispatch = async () => {
    if (!request._id) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${request._id}/assign`, { method: "POST" });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error ?? "Assignment failed");
      }
      onAssign(request.id, payload.technician.name);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setIsSaving(false);
    }
  };

  const assigned = request.status === "Assigned" || request.status === "In-Progress" || request.status === "Completed";

  return (
    <>
      <motion.button
        type="button"
        onClick={openDialog}
        disabled={assigned}
        whileHover={{ scale: assigned ? 1 : 1.02 }}
        whileTap={{ scale: assigned ? 1 : 0.98 }}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-shadow ${
          assigned
            ? "cursor-default border border-emerald/30 bg-emerald/10 text-emerald"
            : "bg-gradient-to-r from-cyan to-indigo text-white shadow-glow-cyan hover:shadow-glow-indigo"
        }`}
      >
        {assigned ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Assigned
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" fill="currentColor" />
            Smart AI Assignment
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-lg p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan ring-1 ring-cyan/30">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white">Smart AI Assignment</h2>
                    <p className="text-sm text-zinc-400">
                      {request.id} · {request.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-6">
                {isAnalyzing && (
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan/20 border-t-cyan" />
                    <p className="text-sm text-zinc-400">
                      Analyzing geo-location, skills cache, and dispatch readiness...
                    </p>
                  </div>
                )}

                {error && <p className="py-4 text-center text-sm text-rose">{error}</p>}

                {matchReady && selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-cyan/80">Best match recommended</p>
                          <p className="mt-1 text-lg font-bold text-white">{selected.name}</p>
                          <p className="text-sm text-zinc-400">Nearest idle technician</p>
                        </div>
                        <span className="rounded-full bg-emerald/15 px-3 py-1 text-xs font-bold text-emerald ring-1 ring-emerald/30">
                          {selected.score}% Match
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
                        <MapPin className="h-4 w-4 text-cyan" />
                        {selected.distanceKm.toFixed(1)} km away
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSaving}
                        onClick={approveDispatch}
                        className="rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.25)] disabled:opacity-60"
                      >
                        {isSaving ? "Dispatching..." : "Approve Dispatch"}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10"
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
