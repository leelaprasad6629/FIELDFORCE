import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Map, RefreshCw, Users, Navigation, Loader2 } from "lucide-react";
import { useApi } from "../lib/api";
import { cn } from "../lib/utils";
import * as L from "leaflet";

interface Technician {
  _id: string; name: string; status: string; location: string;
  lat: number; lng: number; currentTask: string | null;
  email?: string | null; phone?: string | null;
  lastLocationUpdate?: string | null;
}

const statusColors: Record<string, { dot: string; badge: string; hex: string }> = {
  "on-route": { dot: "bg-amber-400", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", hex: "#fbbf24" },
  "on-site": { dot: "bg-emerald-400", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", hex: "#34d399" },
  "idle": { dot: "bg-slate-400", badge: "bg-slate-500/20 text-slate-400 border-slate-500/30", hex: "#94a3b8" },
  "break": { dot: "bg-indigo-400", badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", hex: "#818cf8" },
};



function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 30000) return "just now";
  if (diff < 60000) return "<1 min ago";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return new Date(iso).toLocaleDateString();
}

function isStale(iso: string | null | undefined): boolean {
  if (!iso) return true;
  return Date.now() - new Date(iso).getTime() > 5 * 60 * 1000;
}

function makeTechIcon(status: string, tech?: Technician): L.DivIcon {
  const hex = statusColors[status]?.hex ?? statusColors.idle.hex;
  const stale = isStale(tech?.lastLocationUpdate);
  const staleRing = stale && status !== "on-route" ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:1px dashed rgba(239,68,68,0.5);"></div>` : "";
  const pulsing = status === "on-route" ? `<span style="position:absolute;inset:0;border-radius:50%;animation:ping 1s infinite;opacity:0.5;background:${hex}40"></span>` : "";
  return L.divIcon({
    className: "tech-marker",
    html: `<div style="position:relative;width:20px;height:20px;">${staleRing}${pulsing}<div style="position:relative;width:16px;height:16px;border-radius:50%;background:${hex};border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 6px ${hex}80;"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function makeTechPopup(tech: Technician): string {
  const colors = statusColors[tech.status] ?? statusColors.idle;
  return [
    '<div style="font-family:Inter,sans-serif;min-width:180px;">',
    `<div style="font-weight:600;color:#f1f5f9;font-size:14px;margin-bottom:4px;">${tech.name}</div>`,
    `<div style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:500;border:1px solid ${colors.hex}40;background:${colors.hex}20;color:${colors.hex};text-transform:capitalize;">${tech.status.replace("-", " ")}</div>`,
    '<div style="margin-top:8px;font-size:12px;color:#94a3b8;line-height:1.5;">',
    tech.currentTask ? `<div><strong style="color:#cbd5e1;">Task:</strong> ${tech.currentTask}</div>` : "",
    `<div><strong style="color:#cbd5e1;">Location:</strong> ${tech.location}</div>`,
    `<div><strong style="color:#cbd5e1;">Coords:</strong> ${tech.lat.toFixed(4)}, ${tech.lng.toFixed(4)}</div>`,
    `<div><strong style="color:#cbd5e1;">Updated:</strong> ${timeAgo(tech.lastLocationUpdate)}</div>`,
    '</div></div>',
  ].join("");
}

export default function MapPage() {
  const { fetchApi } = useApi();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selected, setSelected] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const map = L.map(containerRef.current, {
        center: [40.7128, -74.006],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark theme tile layer (CartoDB Dark Matter - free, no API key)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      setLoading(false);

      // Fix map rendering after container becomes visible
      setTimeout(() => map.invalidateSize(), 200);
    } catch (err) {
      setMapError(err instanceof Error ? err.message : "Failed to initialize map");
      setLoading(false);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchApi<Technician[]>("/technicians");
      setTechnicians(data);

      if (!mapRef.current) return;

      // Remove old markers
      Object.values(markersRef.current).forEach((m) => mapRef.current?.removeLayer(m));
      markersRef.current = {};

      // Add new markers for technicians with valid coordinates
      const validTechs = data.filter((t) => typeof t.lat === "number" && typeof t.lng === "number");
      const bounds: [number, number][] = [];

      for (const tech of validTechs) {
        const marker = L.marker([tech.lat, tech.lng], { icon: makeTechIcon(tech.status, tech) })
          .bindPopup(makeTechPopup(tech))
          .addTo(mapRef.current!);

        marker.on("click", () => setSelected(tech));
        markersRef.current[tech._id] = marker;
        bounds.push([tech.lat, tech.lng]);
      }

      // Fit bounds to show all technicians
      if (bounds.length > 0) {
        if (bounds.length === 1) {
          mapRef.current.setView(bounds[0], 14);
        } else {
          mapRef.current.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 15 });
        }
      }

      mapRef.current.invalidateSize();
      setLastUpdated(new Date());
    } catch {
      /* noop */
    } finally { setRefreshing(false); }
  }, [fetchApi]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  // Pan to selected technician
  useEffect(() => {
    if (selected && mapRef.current && markersRef.current[selected._id]) {
      mapRef.current.panTo([selected.lat, selected.lng], { animate: true });
      markersRef.current[selected._id].openPopup();
    }
  }, [selected]);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Map className="w-5 h-5 text-cyan-400" /> Live Fleet Map</h1>
          <p className="text-slate-400 text-sm mt-1">Technician positions update every 15s{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : ""}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:text-white hover:bg-white/5 transition">
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Leaflet Map */}
        <div className="lg:col-span-2 glass p-0 overflow-hidden relative rounded-xl" style={{ minHeight: "500px" }}>
          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0E1521]">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          )}
          {mapError && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0E1521]">
              <div className="text-center">
                <p className="text-rose-400 text-sm font-medium mb-2">Map failed to load</p>
                <p className="text-slate-500 text-xs">{mapError}</p>
              </div>
            </div>
          )}
          <div ref={containerRef} className="absolute inset-0" style={{ background: "#0E1521" }} />

          {/* Legend overlay */}
          <div className="absolute bottom-4 right-4 z-[500] glass p-3 text-xs space-y-1.5 pointer-events-none">
            {Object.entries(statusColors).map(([status, { hex }]) => (
              <div key={status} className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: hex }} />
                {status.replace("-", " ")}
              </div>
            ))}
            <div className="flex items-center gap-2 text-slate-400 pt-1 border-t border-white/10">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-rose-500/50" />
              Stale (&gt;5 min)
            </div>
          </div>
        </div>

        {/* Field Crew Sidebar */}
        <div className="glass p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> Field Crew</h2>
          {technicians.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-4">No technicians found. Add technicians from the Dashboard.</p>
          )}
          <div className="space-y-2">
            {technicians.map((t) => {
              const colors = statusColors[t.status] ?? statusColors.idle;
              return (
                <motion.button key={t._id} onClick={() => setSelected(selected?._id === t._id ? null : t)}
                  className={cn("w-full text-left px-3 py-3 rounded-xl border transition-all", selected?._id === t._id ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/8 bg-white/4 hover:bg-white/7")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{t.name}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", colors.badge)}>
                      {t.status.replace("-", " ")}
                    </span>
                    {isStale(t.lastLocationUpdate) && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Location not updated recently" />
                    )}
                  </div>
                  <p className="text-slate-500 text-xs truncate">{t.currentTask ?? t.location}</p>
                  {selected?._id === t._id && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5"><Navigation className="w-3 h-3" />{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</div>
                      <div><span className="text-slate-500">Location: </span>{t.location}</div>
                      <div><span className="text-slate-500">Last seen: </span><span className={isStale(t.lastLocationUpdate) ? "text-rose-400" : "text-slate-400"}>{timeAgo(t.lastLocationUpdate)}</span></div>
                      {t.currentTask && <div><span className="text-slate-500">Task: </span>{t.currentTask}</div>}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
