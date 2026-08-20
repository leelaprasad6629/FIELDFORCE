import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Loader2, DollarSign, Plus, X, RefreshCw, MapPin, Wifi, WifiOff, Crosshair, Satellite, AlertCircle } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";

interface ChecklistItem { label: string; done: boolean; }
interface Task {
  _id: string; taskId: string; title: string; status: string; priority: string;
  zone: string; location: string; eta: string | null; checklist: ChecklistItem[];
  category: string; customerName: string | null;
}
interface Expense { _id?: string; id?: string; amount: number; category: string; description: string; status: string; createdAt?: string; }
interface TechProfile { _id: string; name: string; status: string; location: string; currentTask: string | null; lat?: number; lng?: number; }

const priorityColors: Record<string, string> = {
  critical: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  high: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  medium: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  low: "text-slate-400 border-slate-500/40 bg-slate-500/10",
};

const statusBadge: Record<string, string> = {
  "idle": "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "on-route": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "on-site": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "break": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const EXP_CATEGORIES = ["Fuel", "Meals", "Parking", "Parts", "Tools", "Accommodation", "Miscellaneous"];

export default function TechnicianView() {
  const { fetchApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<TechProfile | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ amount: "", category: "Fuel", description: "" });
  const [savingExp, setSavingExp] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [online, setOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // GPS / Location tracking state
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationShared, setLocationShared] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [t, e, me] = await Promise.all([
        fetchApi<Task[]>("/tasks?mine=true"),
        fetchApi<Expense[]>("/expenses"),
        fetchApi<{ technician: TechProfile | null }>("/user/me"),
      ]);
      setTasks(t);
      setExpenses(e);
      setProfile(me.technician);
      setLastRefresh(new Date());
      setOnline(true);
    } catch {
      setOnline(false);
    } finally { setRefreshing(false); setInitialLoad(false); }
  }, [fetchApi]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  // Start automatic GPS tracking with watchPosition
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }

    // Start watching position for real-time tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setGpsActive(true);
        setGpsError(null);

        // Throttle API updates to max once per 10 seconds to avoid spamming
        const now = Date.now();
        if (now - lastUpdateRef.current >= 10000) {
          lastUpdateRef.current = now;
          // Send location update to backend
          fetchApi("/user/me/location", {
            method: "PATCH",
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          }).catch(() => {
            // Non-fatal: location update failed, will retry on next position change
          });
        }
      },
      (err) => {
        setGpsActive(false);
        const messages: Record<number, string> = {
          1: "Location permission denied. Enable location access to share your position.",
          2: "Location unavailable. Check your GPS or network connection.",
          3: "Location request timed out.",
        };
        setGpsError(messages[err.code] || "Failed to get location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [fetchApi]);

  async function toggleCheck(task: Task, idx: number) {
    const checklist = task.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c);
    try {
      const updated = await fetchApi<Task>(`/tasks/${task._id}`, { method: "PATCH", body: JSON.stringify({ checklist }) });
      setTasks((prev) => prev.map((t) => t._id === task._id ? updated : t));
    } catch { /* noop */ }
  }

  async function completeTask(task: Task) {
    setCompleting(task._id);
    try {
      await fetchApi(`/tasks/${task._id}`, { method: "PATCH", body: JSON.stringify({ action: "complete" }) });
      await load();
    } catch { /* noop */ }
    finally { setCompleting(null); }
  }

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      // Try to get fresh GPS reading
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000, enableHighAccuracy: true })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          setCurrentCoords({ lat, lng });
        } catch (err) {
          // Use cached coords if available
          if (currentCoords) {
            lat = currentCoords.lat;
            lng = currentCoords.lng;
          }
        }
      }
      await fetchApi("/user/me/status", { method: "PATCH", body: JSON.stringify({ status, lat, lng }) });
      await load();
    } catch { /* noop */ }
    finally { setUpdatingStatus(false); }
  }

  async function shareLocation() {
    setUpdatingStatus(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      setUpdatingStatus(false);
      return;
    }
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, enableHighAccuracy: true })
      );
      const { latitude, longitude } = pos.coords;
      setCurrentCoords({ lat: latitude, lng: longitude });
      setGpsActive(true);
      await fetchApi("/user/me/location", {
        method: "PATCH",
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });
      setLocationShared(true);
      setTimeout(() => setLocationShared(false), 3000);
      await load();
    } catch (err) {
      setGpsActive(false);
      if (err instanceof GeolocationPositionError) {
        const messages: Record<number, string> = {
          1: "Location permission denied. Enable location access in your browser.",
          2: "Location unavailable. Check your GPS or network connection.",
          3: "Location request timed out. Try again.",
        };
        setGpsError(messages[err.code] || "Failed to get location.");
      } else {
        setGpsError("Failed to get location.");
      }
    } finally { setUpdatingStatus(false); }
  }

  async function logExpense() {
    setSavingExp(true);
    try {
      await fetchApi("/expenses", { method: "POST", body: JSON.stringify({ amount: Number(expForm.amount), category: expForm.category, description: expForm.description }) });
      setShowExpForm(false);
      setExpForm({ amount: "", category: "Fuel", description: "" });
      const e = await fetchApi<Expense[]>("/expenses");
      setExpenses(e);
    } catch { /* noop */ }
    finally { setSavingExp(false); }
  }

  const currentStatus = profile?.status ?? "idle";

  if (initialLoad) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            {online ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
            Auto-refreshes every 8s · last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:text-white hover:bg-white/5 transition">
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Profile + Status Panel */}
      {profile ? (
        <div className="glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-white font-semibold">{profile.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <p className="text-slate-400 text-sm truncate">{profile.currentTask ?? profile.location}</p>
            </div>
            {/* GPS Status & Coordinates */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={cn("text-xs flex items-center gap-1", gpsActive ? "text-emerald-400" : "text-slate-500")}>
                <Satellite className={cn("w-3 h-3", gpsActive && "animate-pulse")} />
                {gpsActive ? "GPS Active" : "GPS Off"}
              </span>
              {currentCoords && (
                <span className="text-xs text-slate-500">
                  {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                </span>
              )}
              {locationShared && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> Location shared
                </span>
              )}
            </div>
            {gpsError && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" /> {gpsError}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2.5 py-1 rounded-full border capitalize", statusBadge[currentStatus] ?? statusBadge.idle)}>
              {currentStatus.replace("-", " ")}
            </span>
            {currentStatus === "on-route" && (
              <button onClick={() => updateStatus("on-site")} disabled={updatingStatus}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition disabled:opacity-40 flex items-center gap-1.5">
                {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : "Check In On-Site"}
              </button>
            )}
            {(currentStatus === "on-site" || currentStatus === "idle") && tasks.length === 0 && (
              <button onClick={() => updateStatus(currentStatus === "idle" ? "break" : "idle")} disabled={updatingStatus}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-500/15 border border-slate-500/30 text-slate-400 hover:bg-slate-500/25 transition disabled:opacity-40 flex items-center gap-1.5">
                {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : currentStatus === "idle" ? "Take a Break" : "Back to Idle"}
              </button>
            )}
            <button onClick={shareLocation} disabled={updatingStatus}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition disabled:opacity-40 flex items-center gap-1.5">
              {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />} Share Location
            </button>
          </div>
        </div>
      ) : (
        <div className="glass p-4 border border-amber-500/30 bg-amber-500/8">
          <p className="text-amber-400 text-sm font-medium">Profile not linked</p>
          <p className="text-slate-400 text-xs mt-1">
            Your technician profile hasn't been created yet. If your manager added you by email, make sure you signed up with the same email address. Otherwise, ask your manager to add your profile.
          </p>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="glass p-12 text-center text-slate-500">
          <p className="text-base mb-2">No tasks assigned yet.</p>
          <p className="text-sm text-slate-600">Your manager will dispatch one using Smart Assign. This page refreshes automatically.</p>
        </div>
      )}

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="text-white font-semibold">{task.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", priorityColors[task.priority] ?? priorityColors.low)}>
                    {task.priority}
                  </span>
                  <span className="text-slate-500 text-xs">{task.zone} · {task.location}</span>
                  {task.eta && <span className="text-slate-500 text-xs">ETA: {task.eta}</span>}
                </div>
              </div>
              {task.status !== "Completed" && (
                <button onClick={() => completeTask(task)} disabled={completing === task._id}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition disabled:opacity-40 flex items-center gap-1.5">
                  {completing === task._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Complete"}
                </button>
              )}
            </div>

            {task.checklist && task.checklist.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/6">
                <p className="text-slate-500 text-xs mb-2">Checklist</p>
                <div className="space-y-1.5">
                  {task.checklist.map((item, idx) => (
                    <button key={idx} onClick={() => toggleCheck(task, idx)}
                      className="flex items-center gap-2 w-full text-left group">
                      {item.done ? <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Square className="w-4 h-4 text-slate-600 flex-shrink-0 group-hover:text-slate-400" />}
                      <span className={cn("text-sm", item.done ? "text-slate-500 line-through" : "text-slate-300")}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Expense Section */}
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-400" /> My Expenses</h2>
          <button onClick={() => setShowExpForm(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition">
            <Plus className="w-3 h-3" /> Log Expense
          </button>
        </div>
        {expenses.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No expenses submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e._id ?? e.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/4 border border-white/6">
                <div>
                  <p className="text-white text-sm">${e.amount.toFixed(2)} · {e.category}</p>
                  {e.description && <p className="text-slate-500 text-xs">{e.description}</p>}
                  {e.createdAt && <p className="text-slate-600 text-xs">{formatDate(e.createdAt)}</p>}
                </div>
                <span className={cn("text-xs px-2 py-1 rounded-full border", e.status === "Approved" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : e.status === "Rejected" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30")}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      <AnimatePresence>
        {showExpForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
              onClick={() => setShowExpForm(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
                className="glass w-full max-w-sm p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-bold text-lg">Log Expense</h2>
                  <button onClick={() => setShowExpForm(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Amount ($) *</label>
                    <input type="number" step="0.01" min="0" value={expForm.amount}
                      onChange={(e) => setExpForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Category *</label>
                    <select value={expForm.category} onChange={(e) => setExpForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full bg-[#0E1521] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                      {EXP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Description</label>
                    <textarea value={expForm.description} onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Optional notes..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowExpForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5">
                    Cancel
                  </button>
                  <button onClick={logExpense} disabled={savingExp || !expForm.amount}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                    {savingExp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
