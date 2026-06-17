"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import type { UserRole } from "@/lib/roles";

export default function Header() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as UserRole | undefined;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/15 text-cyan ring-1 ring-cyan/30">
            <Zap className="h-4 w-4" fill="currentColor" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">FieldForce 360</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
            </span>
            <span className="text-xs font-medium text-zinc-300">System Connection: Active</span>
          </div>

          {role && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold capitalize text-zinc-200">
              {role}
            </span>
          )}

          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-1 ring-white/15",
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 bg-white/[0.02] px-4 py-1.5 sm:px-6">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker-scroll gap-12 whitespace-nowrap text-xs text-zinc-400">
            {[0, 1].map((dup) => (
              <span key={dup} className="flex gap-12">
                <span>
                  All systems nominal. Real-time telemetry and routing pipelines are fully operational.
                </span>
                <span className="text-cyan/70">Live dispatch routing active</span>
                <span>Geo-fence verification online</span>
                <span className="text-cyan/70">Predictive analytics streaming</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
