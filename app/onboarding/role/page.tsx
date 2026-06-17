"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { HardHat, LayoutDashboard } from "lucide-react";
import AuthLayoutShell from "@/components/AuthLayoutShell";
import { homePathForRole, type UserRole } from "@/lib/roles";

export default function RoleOnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectRole = async (role: UserRole) => {
    setLoading(role);
    setError(null);
    try {
      const res = await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to save role");
      }
      await user?.reload();
      router.replace(homePathForRole(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <AuthLayoutShell>
      <div className="space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Choose your role</h1>
          <p className="mt-2 text-sm text-zinc-400">
            This selection is permanent for your account and controls which workspace you access.
          </p>
        </div>

        <div className="grid gap-4">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => selectRole("manager")}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors hover:border-cyan/40 hover:bg-cyan/5 disabled:opacity-60"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/10 text-cyan ring-1 ring-cyan/30">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold text-white">Manager</span>
              <span className="text-sm text-zinc-400">Dashboard, dispatch, analytics, and live map</span>
            </span>
          </button>

          <button
            type="button"
            disabled={loading !== null}
            onClick={() => selectRole("technician")}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors hover:border-emerald/40 hover:bg-emerald/5 disabled:opacity-60"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald ring-1 ring-emerald/30">
              <HardHat className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold text-white">Technician</span>
              <span className="text-sm text-zinc-400">Assigned tasks, checklist, and field execution</span>
            </span>
          </button>
        </div>

        {error && <p className="text-sm text-rose">{error}</p>}
      </div>
    </AuthLayoutShell>
  );
}
