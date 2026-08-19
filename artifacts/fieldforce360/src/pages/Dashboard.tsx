import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ClipboardList, Activity, Zap, Bell, AlertTriangle, Info, RefreshCw, Plus, X, Loader2, DollarSign, Check, XCircle, Trash2, MapPin, Navigation } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface Stats { serviceRequests: number; activeTechnicians: number; taskOverview: number; dispatchReadiness: number; }
interface AlertItem { _id: string; message: string; timestamp: string; type: "info" | "warning" | "critical"; }
interface Technician { _id: string; name: string; status: string; currentTask: string | null; location: string; email: string | null; phone: string | null; clerkUserId: string | null; lastLocationUpdate?: string | null; lat?: number; lng?: number; }
interface Expense { _id: string; amount: number; category: string; description: string; status: string; loggedByUserId: string; createdAt: string; loggedByName?: string; }

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 30000) return "just now";
  if (diff < 60000) return "<1 min ago";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  return `${Math.floor(diff / 3600000)} hr ago`;
}

const statusColors: Record<string, string> = {
  "on-route": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "on-site": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "idle": "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "break": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const alertIcon = { info: Info, warning: AlertTriangle, critical: AlertTriangle };
const alertColor = { info: "text-cyan-400", warning: "text-amber-400", critical: "text-rose-400" };
const alertBorder = { info: "border-cyan-500/20", warning: "border-amber-500/20", critical: "border-rose-500/30" };

const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Zone Alpha": { lat: 40.72, lng: -74.01 },
  "Zone Beta": { lat: 40.73, lng: -74.005 },
  "Zone Delta": { lat: 40.74, lng: -73.99 },
  "Depot HQ": { lat: 40.71, lng: -74.03 },
  "Zone Bravo": { lat: 40.715, lng: -74.02 },
};

interface TechForm {
  name: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  lat: number | null;
  lng: number | null;
  useGps: boolean;
}

const emptyForm: TechForm = { name: "", email: "", phone: "", location: "Depot HQ", status: "idle", lat: null, lng: null, useGps: false };

const modalVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.97 },
};
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function Dashboard() {
  const { fetchApi } = useApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [showAddTech, setShowAddTech] = useState(false);
  const [techForm, setTechForm] = useState<TechForm>(emptyForm);
  const [addingTech, setAddingTech] = useState(false);
  const [techError, setTechError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [approvingExp, setApprovingExp] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, a, t, e] = await Promise.all([
        fetchApi<Stats>("/stats"),
        fetchApi<AlertItem[]>("/alerts?limit=20"),
        fetchApi<Technician[]>("/technicians"),
        fetchApi<Expense[]>("/expenses"),
      ]);
      setStats(s);
      setAlerts(a);
      setTechnicians(t);
      setPendingExpenses(e.filter((exp) => exp.status === "Pending"));
      setLastUpdated(new Date());
    } catch { /* empty state shown */ }
    finally { setRefreshing(false); setInitialLoad(false); }
  }, [fetchApi]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Capture real-time GPS location
  const getMyLocation = useCallback(() => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setTechForm((f) => ({ ...f, lat: latitude, lng: longitude, useGps: true, location: "Current Location" }));
        setGpsLoading(false);
        // Try reverse geocoding for a readable location name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            const addr = data.address || {};
            const shortName = [addr.suburb, addr.city || addr.town || addr.village, addr.state]
              .filter(Boolean)
              .slice(0, 2)
              .join(", ");
            setTechForm((f) => ({ ...f, location: shortName || data.display_name.slice(0, 60) }));
          }
        } catch {
          // If reverse geocoding fails, keep "Current Location" as the name
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Permission denied. Please allow location access in your browser.",
          2: "Location unavailable. Check your GPS or network connection.",
          3: "Location request timed out. Try again.",
        };
        setGpsError(messages[err.code] || "Failed to get location.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  async function addTechnician() {
    if (!techForm.name.trim()) return;
    setAddingTech(true); setTechError(null);
    try {
      let lat: number;
      let lng: number;
      if (techForm.useGps && techForm.lat !== null && techForm.lng !== null) {
        lat = techForm.lat;
        lng = techForm.lng;
      } else {
        const coords = ZONE_COORDS[techForm.location] ?? { lat: 40.7128, lng: -74.006 };
        lat = coords.lat;
        lng = coords.lng;
      }
      await fetchApi("/technicians", {
        method: "POST",
        body: JSON.stringify({
          name: techForm.name.trim(),
          email: techForm.email.trim() || null,
          phone: techForm.phone.trim() || null,
          location: techForm.location,
          status: techForm.status,
          lat,
          lng,
        }),
      });
      setShowAddTech(false);
      setTechForm(emptyForm);
      setGpsError(null);
      await load();
    } catch (e: unknown) {
      setTechError(e instanceof Error ? e.message : "Failed to add technician");
    } finally { setAddingTech(false); }
  }

  async function approveExpense(id: string, status: "Approved" | "Rejected") {
    setApprovingExp(id);
    try {
      await fetchApi(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setPendingExpenses((prev) => prev.filter((e) => e._id !== id));
      const a = await fetchApi<AlertItem[]>("/alerts?limit=20");
      setAlerts(a);
    } catch { /* noop */ }
    finally { setApprovingExp(null); }
  }

  async function dismissAlert(id: string) {
    try {
      await fetchApi(`/alerts/${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch { /* noop */ }
  }

  const statCards = [
    { label: "Open Requests", value: stats?.serviceRequests, icon: ClipboardList, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Active Technicians", value: stats?.activeTechnicians, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Tasks In Progress", value: stats?.taskOverview, icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Dispatch Readiness", value: stats ? `${stats.dispatchReadiness}%` : undefined, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time overview · auto-refreshes every 30s{stats ? ` · ${pendingExpenses.length} pending expenses` : ""}{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} /> Refresh
          </button>
          <button onClick={() => setShowAddTech(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/25 transition">
            <Plus className="w-4 h-4" /> Add Technician
          </button>
        </div>
      </div>

      {initialLoad ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass glass-hover p-5 group">
            <div className="shimmer-overlay" />
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{value ?? "—"}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {pendingExpenses.length > 0 && (
        <div className="glass p-5 border border-amber-500/20">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Pending Expense Approvals
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">{pendingExpenses.length}</span>
            <span className="text-xs text-slate-500 ml-1">· ${pendingExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)} pending</span>
          </h2>
          <div className="space-y-2">
            {pendingExpenses.map((e) => (
              <div key={e._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/4 border border-white/8 gap-4">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium">${e.amount.toFixed(2)} · {e.category}</p>
                  <p className="text-slate-500 text-xs">{e.loggedByName ?? "Technician"} · {formatDate(e.createdAt)}</p>
                  {e.description && <p className="text-slate-600 text-xs truncate">{e.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => approveExpense(e._id, "Approved")} disabled={approvingExp === e._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/25 transition disabled:opacity-40">
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => approveExpense(e._id, "Rejected")} disabled={approvingExp === e._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs hover:bg-rose-500/25 transition disabled:opacity-40">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> Field Crew ({technicians.length})</h2>
            <button onClick={() => setShowAddTech(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {technicians.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm mb-3">No technicians yet.</p>
              <p className="text-slate-600 text-xs">Click <span className="text-emerald-400">Add Technician</span> to add your first field engineer.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {technicians.map((t) => (
                <div key={t._id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/4 border border-white/6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      {t.clerkUserId ? (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Linked</span>
                      ) : (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-500/15 text-slate-500 border border-slate-500/20">Unlinked</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{t.currentTask ?? t.location}</p>
                    {t.lat !== undefined && t.lng !== undefined && (
                      <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t.lat.toFixed(4)}, {t.lng.toFixed(4)}
                      </p>
                    )}
                    {(t.email || t.phone) && (
                      <p className="text-slate-600 text-xs mt-0.5">{[t.email, t.phone].filter(Boolean).join(" · ")}</p>
                    )}
                    <p className="text-slate-600 text-xs mt-0.5">Last seen: {timeAgo(t.lastLocationUpdate)}</p>
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full border capitalize flex-shrink-0", statusColors[t.status] ?? statusColors.idle)}>
                    {t.status.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" /> Alert Feed
            {alerts.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">{alerts.length}</span>}
          </h2>
          {alerts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No alerts. Activity alerts appear here as requests, tasks, expenses, and check-ins occur.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {alerts.map((a) => {
                const Icon = alertIcon[a.type] ?? Info;
                return (
                  <div key={a._id} className={cn("flex gap-3 py-2.5 px-3 rounded-xl bg-white/4 border group", alertBorder[a.type] ?? "border-white/6")}>
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alertColor[a.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm leading-snug">{a.message}</p>
                      <p className="text-slate-500 text-xs mt-0.5" title={new Date(a.timestamp).toLocaleString()}>{timeAgo(a.timestamp)}</p>
                    </div>
                    <button onClick={() => dismissAlert(a._id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddTech && (
          <>
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
              onClick={() => { setShowAddTech(false); setTechError(null); setGpsError(null); }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                key="modal"
                variants={modalVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                className="glass w-full max-w-sm p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-bold text-lg">Add Technician</h2>
                  <button onClick={() => { setShowAddTech(false); setTechError(null); setGpsError(null); }} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Full Name *</label>
                    <input value={techForm.name} onChange={(e) => setTechForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">
                      Email <span className="text-slate-600">(must match their sign-up email)</span>
                    </label>
                    <input type="email" value={techForm.email} onChange={(e) => setTechForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="e.g. alex@yourcompany.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600" />
                    <p className="text-slate-600 text-xs mt-1">Enter the same email they'll use to sign up — tasks will auto-link to their account.</p>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Phone <span className="text-slate-600">(optional)</span></label>
                    <input type="tel" value={techForm.phone} onChange={(e) => setTechForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. +1 555-0123"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600" />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Location</label>
                    <button
                      onClick={getMyLocation}
                      disabled={gpsLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/25 transition disabled:opacity-40 mb-2"
                    >
                      {gpsLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Getting location...</>
                      ) : techForm.useGps ? (
                        <><MapPin className="w-4 h-4 text-emerald-400" /> Location captured</>
                      ) : (
                        <><Navigation className="w-4 h-4" /> Use My Current Location</>
                      )}
                    </button>
                    {techForm.useGps && techForm.lat !== null && techForm.lng !== null && (
                      <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-2">
                        <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          GPS: {techForm.lat.toFixed(4)}, {techForm.lng.toFixed(4)}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">{techForm.location}</p>
                      </div>
                    )}
                    {gpsError && <p className="text-rose-400 text-xs mt-1 mb-2">{gpsError}</p>}
                    <p className="text-slate-600 text-xs mb-1">Or select a zone manually:</p>
                    <select
                      value={techForm.useGps ? "" : techForm.location}
                      onChange={(e) => setTechForm((f) => ({ ...f, location: e.target.value, useGps: false, lat: null, lng: null }))}
                      className="w-full bg-[#0E1521] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="" disabled>— Select zone —</option>
                      {Object.keys(ZONE_COORDS).map((z) => <option key={z} value={z}>{z}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Initial Status</label>
                    <select value={techForm.status} onChange={(e) => setTechForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full bg-[#0E1521] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                      <option value="idle">Idle (available for dispatch)</option>
                      <option value="break">On Break</option>
                    </select>
                  </div>
                </div>
                {techError && <p className="text-rose-400 text-sm mt-3">{techError}</p>}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setShowAddTech(false); setTechError(null); setGpsError(null); }} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5">
                    Cancel
                  </button>
                  <button onClick={addTechnician} disabled={addingTech || !techForm.name.trim() || (!techForm.useGps && !techForm.location)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                    {addingTech ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Technician"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
